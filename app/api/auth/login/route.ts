// app/api/auth/login/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

const alg = 'HS256';
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me');

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return new NextResponse('Missing credentials', { status: 400 });
  }

  const email = String(body.email).toLowerCase();

  // Look up user with Drizzle
  const found = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = found[0];
  if (!user || !user.active) {
    return new NextResponse('Invalid credentials', { status: 401 });
  }

  // Verify password
  const ok = await bcrypt.compare(String(body.password), user.passwordHash);
  if (!ok) {
    return new NextResponse('Invalid credentials', { status: 401 });
  }

  // Sign a JWT and set cookie "session"
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);

  const jar = cookies();
  jar.set('session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return NextResponse.json({ ok: true });
}