import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { db, type User, type Role } from './db';

const alg = 'HS256';
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me');

export async function hashPassword(password: string) { const salt = await bcrypt.genSalt(10); return bcrypt.hash(password, salt); }
export async function verifyPassword(password: string, hash: string) { return bcrypt.compare(password, hash); }

export type Session = { sub: string; email: string; role: Role; name: string };
export async function signSession(user: User) {
  return await new SignJWT({ email: user.email, role: user.role, name: user.name })
    .setProtectedHeader({ alg }).setSubject(user.id).setIssuedAt().setExpirationTime('7d').sign(secret);
}
export async function readSession(): Promise<Session | null> {
  try {
    const token = cookies().get('session')?.value; if (!token) return null;
    const { payload } = await jwtVerify(token, secret);
    return { sub: String(payload.sub), email: String(payload.email), role: payload.role as Role, name: String(payload.name) };
  } catch { return null; }
}
export async function requireRole(role: Role | Role[]) {
  const s = await readSession(); if (!s) throw Object.assign(new Error('Unauthorized'), { status: 401 });
  const roles = Array.isArray(role) ? role : [role]; if (!roles.includes(s.role)) throw Object.assign(new Error('Forbidden'), { status: 403 });
  return s;
}
export async function currentUser() { const s = await readSession(); if (!s) return null; return db.data.users.find(u=>u.id===s.sub) || null; }
