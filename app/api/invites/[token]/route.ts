
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { invites, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(_: Request, { params }: { params: { token: string } }) {
  const [inv] = await db.select().from(invites).where(eq(invites.token, params.token)).limit(1);
  if (!inv) return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
  if (inv.usedAt) return NextResponse.json({ error: 'Invite already used' }, { status: 400 });
  if (new Date(inv.expiresAt) < new Date()) return NextResponse.json({ error: 'Invite expired' }, { status: 400 });
  return NextResponse.json({ ok: true, token: inv.token, role: inv.role, email: inv.email });
}

export async function POST(req: Request, { params }: { params: { token: string } }) {
  const body = await req.json().catch(()=>null);
  const name = body?.name?.toString() || '';
  const email = (body?.email?.toString() || '').toLowerCase();
  const password = body?.password?.toString() || '';

  const [inv] = await db.select().from(invites).where(eq(invites.token, params.token)).limit(1);
  if (!inv) return new NextResponse('Invite not found', { status: 404 });
  if (inv.usedAt) return new NextResponse('Invite already used', { status: 400 });
  if (new Date(inv.expiresAt) < new Date()) return new NextResponse('Invite expired', { status: 400 });

  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(users).values({
    id, name, email: email || inv.email || '', role: inv.role, passwordHash, active: true
  });

  await db.update(invites).set({ usedAt: new Date(), usedBy: id }).where(eq(invites.token, params.token));

  return NextResponse.json({ ok: true });
}
