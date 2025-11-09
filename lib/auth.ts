// lib/auth.ts
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { db } from './db';
import { users } from './schema';
import { eq } from 'drizzle-orm';

export type Role = 'STAFF' | 'ADMIN' | 'SUPER';

export type SessionClaims = {
  sub: string;          // user.id
  email: string;
  role: Role;
  name?: string | null;
} & JWTPayload;

const alg = 'HS256';
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me');

function roleAtLeast(userRole: Role, required: Role) {
  const order: Record<Role, number> = { STAFF: 1, ADMIN: 2, SUPER: 3 };
  return order[userRole] >= order[required];
}

/** Read/verify the JWT from the "session" cookie. Returns claims or null. */
export async function readSession(): Promise<SessionClaims | null> {
  const token = cookies().get('session')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: [alg] });
    // minimal shape guard
    if (!payload || typeof payload.sub !== 'string' || typeof payload.role !== 'string') return null;
    const claims = payload as SessionClaims;
    return claims;
  } catch {
    return null;
  }
}

/** Returns the full user row from DB for the current session, or null. */
export async function currentUser() {
  const sess = await readSession();
  if (!sess) return null;
  const rows = await db.select().from(users).where(eq(users.id, sess.sub)).limit(1);
  const u = rows[0];
  if (!u || !u.active) return null;
  return u;
}

/** Throws 401 if no session; returns claims when present. */
export async function requireAuth(): Promise<SessionClaims> {
  const sess = await readSession();
  if (!sess) throw new Error('UNAUTHENTICATED');
  return sess;
}

/** Throws 401/403 if missing or insufficient role. Returns claims on success. */
export async function requireRole(required: Role): Promise<SessionClaims> {
  const sess = await readSession();
  if (!sess) throw new Error('UNAUTHENTICATED');
  if (!roleAtLeast(sess.role as Role, required)) throw new Error('FORBIDDEN');
  return sess;
}

/** Issues a JWT for a given user row and sets the "session" cookie. */
export async function issueSessionCookie(u: {
  id: string;
  email: string;
  role: Role;
  name?: string | null;
}) {
  const token = await new SignJWT({
    sub: u.id,
    email: u.email,
    role: u.role,
    name: u.name ?? null,
  })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);

  cookies().set('session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return token;
}

/** Clears the session cookie. */
export function clearSessionCookie() {
  cookies().set('session', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}