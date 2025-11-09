
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST() {
  const existing = await db.select().from(users).where(eq(users.role, 'SUPER')).limit(1);
  if (existing.length > 0) {
    return new NextResponse('Already bootstrapped', { status: 400 });
  }
  const email = (process.env.BOOTSTRAP_SUPERADMIN_EMAIL || 'super@example.com').toLowerCase();
  const name = process.env.BOOTSTRAP_SUPERADMIN_NAME || 'Super Admin';
  const password = process.env.BOOTSTRAP_SUPERADMIN_PASSWORD || 'ChangeMe!123';
  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(users).values({ id, name, email, role: 'SUPER', passwordHash, active: true });
  return NextResponse.json({ ok: true, id, email, role: 'SUPER' });
}
