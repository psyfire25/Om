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
export async function readSession() {
  try {
    const cookie = cookies().get('session')?.value;
    if (!cookie) return null;

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('readSession: JWT_SECRET missing');
      return null;
    }

    const payload = await jwtVerify(
      cookie,
      new TextEncoder().encode(secret),
    );

    return {
      sub: payload.payload.sub as string,
      // plus whatever else you store
    };
  } catch (err) {
    console.error('readSession error', err);
    return null; // <- crucial: don’t throw, just “no session”
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
export async function signSession(payload: { sub: string; email: string; role: Role | string }) {
  const role = (payload.role as string) as Role; // narrow at runtime (we only mint known roles)
  const token = await new SignJWT({ sub: payload.sub, email: payload.email, role })
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