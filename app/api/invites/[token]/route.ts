// app/api/invites/[token]/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invites, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';
import { signSession, type Role } from '@/lib/auth';

// GET: load invite info for the Accept page
export async function GET(_: Request, { params }: { params: { token: string } }) {
  try {
    const [row] = await db.select().from(invites).where(eq(invites.token, params.token)).limit(1);
    if (!row) return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    if (row.usedAt) return NextResponse.json({ error: 'Invite already used' }, { status: 400 });
    if (row.expiresAt && new Date(row.expiresAt) < new Date())
      return NextResponse.json({ error: 'Invite expired' }, { status: 400 });
    return NextResponse.json(row);
  } catch (e: any) {
    return new NextResponse(e?.message || 'Internal error', { status: 500 });
  }
}

// POST: accept invite -> create user + set password + login
export async function POST(req: Request, { params }: { params: { token: string } }) {
  try {
    const body = await req.json().catch(() => null);
    const name = String(body?.name || '').trim();
    const email = String(body?.email || '').toLowerCase().trim();
    const password = String(body?.password || '');

    if (!name || !email || !password)
      return new NextResponse('Missing fields', { status: 400 });

    // Load invite
    const [inv] = await db.select().from(invites).where(eq(invites.token, params.token)).limit(1);
    if (!inv) return new NextResponse('Invite not found', { status: 404 });
    if (inv.usedAt) return new NextResponse('Invite already used', { status: 400 });
    if (inv.expiresAt && new Date(inv.expiresAt) < new Date())
      return new NextResponse('Invite expired', { status: 400 });

    // Duplicate email check -> 409
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing[0]) return new NextResponse('Email already registered', { status: 409 });

    // Hash pass & insert (let DB defaults fill id/createdAt/updatedAt)
    const passwordHash = await hash(password, 10);
    const [created] = await db.insert(users).values({
      name,
      email,
      passwordHash,
      role: (inv.role as Role) ?? 'STAFF',
      active: true,
    }).returning();

    // Mark invite used
    await db.update(invites).set({
      usedAt: new Date(),
      usedBy: created.id,
    }).where(eq(invites.token, params.token));

    // Log in new user
    await signSession({ sub: created.id, email: created.email, role: created.role as Role });

    return NextResponse.json({ ok: true, userId: created.id });
  } catch (e: any) {
    const msg = (e?.message || '').toString();
    if (msg.includes('gen_random_uuid')) {
      // If your DB lacks pgcrypto:
      // run once: CREATE EXTENSION IF NOT EXISTS pgcrypto;
      return new NextResponse('Database missing gen_random_uuid() extension', { status: 500 });
    }
    if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('23505')) {
      return new NextResponse('Email already registered', { status: 409 });
    }
    return new NextResponse(msg || 'Internal error', { status: 500 });
  }
}