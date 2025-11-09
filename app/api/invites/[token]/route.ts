// Force dynamic on Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invites, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';
import { signSession } from '@/lib/auth'; // your JWT set-cookie helper

// GET: load invite info for the Accept page
export async function GET(_: Request, { params }: { params: { token: string } }) {
  const [row] = await db.select().from(invites).where(eq(invites.token, params.token)).limit(1);
  if (!row) return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
  if (row.usedAt) return NextResponse.json({ error: 'Invite already used' }, { status: 400 });
  if (row.expiresAt && new Date(row.expiresAt) < new Date())
    return NextResponse.json({ error: 'Invite expired' }, { status: 400 });
  return NextResponse.json(row);
}

// POST: accept invite -> create user + set password + login
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();
  const email = String(body?.email || '').toLowerCase().trim();
  const password = body?.password;

  const [row] = await db.select().from(invites).where(eq(invites.token, params.token)).limit(1);
  if (!row) return new NextResponse('Invite not found', { status: 404 });
  if (row.usedAt) return new NextResponse('Invite already used', { status: 400 });
  if (row.expiresAt && new Date(row.expiresAt) < new Date())
    return new NextResponse('Invite expired', { status: 400 });

  if (!name || !email || !password) return new NextResponse('Missing fields', { status: 400 });

  const passwordHash = await hash(password, 10);

  // create user
  const inserted = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash,
      role: row.role,      // role comes from invite
      active: true,
      createdAt: new Date(),
    })
    .returning();

  // mark invite used
  await db
    .update(invites)
    .set({ usedAt: new Date(), usedBy: inserted[0].id })
    .where(eq(invites.token, params.token));

  // sign session cookie
  await signSession({ sub: inserted[0].id, role: inserted[0].role, email: inserted[0].email });

  return NextResponse.json({ ok: true, userId: inserted[0].id });
}