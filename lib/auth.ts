// lib/auth.ts
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

/* ------------------------- roles & payload types ------------------------- */

export type Role = 'STAFF' | 'ADMIN' | 'SUPER';

type SessionPayload = JWTPayload & {
  sub: string;       // user id (uuid)
  email: string;
  role: Role;
};

const ROLE_ORDER: Role[] = ['STAFF', 'ADMIN', 'SUPER'];
const alg = 'HS256';
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me');

/* ------------------------------- utilities ------------------------------ */

export function hasRole(userRole: Role, required: Role) {
  return ROLE_ORDER.indexOf(userRole) >= ROLE_ORDER.indexOf(required);
}

/* ---------------------------- session handlers -------------------------- */

/** Verify the `session` cookie and return its payload, or null if missing/invalid. */
export async function readSession(): Promise<SessionPayload | null> {
  const token = cookies().get('session')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: [alg] });
    // Basic shape guard
    if (!payload || typeof payload.sub !== 'string' || typeof payload.role !== 'string') return null;
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

/** Throw 401/403 when not authenticated / lacking role. Returns the payload on success. */
export async function requireRole(required: Role): Promise<SessionPayload> {
  const sess = await readSession();
  if (!sess) {
    // No session → 401
    const e: any = new Error('Unauthorized');
    e.status = 401;
    throw e;
  }
  if (!hasRole(sess.role, required)) {
    // Not enough privilege → 403
    const e: any = new Error('Forbidden');
    e.status = 403;
    throw e;
  }
  return sess;
}

/** Resolve the current DB user from the session, or null. */
export async function currentUser() {
  const sess = await readSession();
  if (!sess) return null;
  const rows = await db.select().from(users).where(eq(users.id, sess.sub)).limit(1);
  return rows[0] ?? null;
}

/** Create a new JWT and set it as the `session` cookie (7d). Returns the token. */
export async function signSession(payload: { sub: string; email: string; role: Role }) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  cookies().set({
    name: 'session',
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });

  return token;
}

/** Clear the session cookie (log out). */
export function clearSession() {
  cookies().set({
    name: 'session',
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}