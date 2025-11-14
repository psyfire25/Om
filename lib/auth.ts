// lib/auth.ts
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

/* ------------------------- roles & payload types ------------------------- */

export type Role = 'STAFF' | 'ADMIN' | 'SUPER';

type SessionUser = {
  sub: string;
  role: 'SUPERADMIN' | 'SUPER' | 'ADMIN' | 'STAFF';
};

type SessionPayload = JWTPayload & {
  sub: string; // user id (uuid)
  email: string;
  role: Role;
};

const ROLE_ORDER: Role[] = ['STAFF', 'ADMIN', 'SUPER'];
const alg = 'HS256';

// 🔑 Single source of truth for the JWT secret (sign + verify)
const rawSecret =
  process.env.JWT_SECRET && process.env.JWT_SECRET.length > 0
    ? process.env.JWT_SECRET
    : 'dev-secret-change-me';

const secret = new TextEncoder().encode(rawSecret);

/* ------------------------------- utilities ------------------------------ */

function hasRole(userRole: SessionUser['role'], required: SessionUser['role'][]) {
  if (!required || required.length === 0) return true;
  return required.includes(userRole);
}

/* ---------------------------- session handlers -------------------------- */

/** Verify the `session` cookie and return its payload, or null if missing/invalid. */
export async function readSession(): Promise<SessionUser | null> {
  try {
    const cookie = cookies().get('session')?.value;
    if (!cookie) return null;

    // ✅ Use the same `secret` that signSession uses
    const { payload } = await jwtVerify(cookie, secret);

    const userId = payload.sub as string | undefined;
    if (!userId) return null;

    const [user] = await db
      .select({
        id: users.id,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return null;

    return {
      sub: user.id,
      role: user.role as SessionUser['role'],
    };
  } catch (err) {
    console.error('readSession error', err);
    return null;
  }
}

export async function requireRole(required: SessionUser['role'][]) {
  const sess = await readSession();
  if (!sess) {
    const e: any = new Error('Unauthorized');
    e.status = 401;
    throw e;
  }

  if (!hasRole(sess.role, required)) {
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
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.id, sess.sub))
    .limit(1);
  return rows[0] ?? null;
}

/** Create a new JWT and set it as the `session` cookie (7d). Returns the token. */
export async function signSession(payload: {
  sub: string;
  email: string;
  role: Role | string;
}) {
  const role = (payload.role as string) as Role; // narrow at runtime (we only mint known roles)

  const token = await new SignJWT({
    sub: payload.sub,
    email: payload.email,
    role,
  } satisfies SessionPayload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret); // ✅ same secret

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