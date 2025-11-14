// app/api/invites/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { db } from '@/lib/db';
import { invites } from '@/lib/schema';
import { readSession } from '@/lib/auth';

function normaliseRole(raw: any): string {
  const r = String(raw || '').toUpperCase();
  if (r === 'SUPER' || r === 'SUPERADMIN') return 'SUPERADMIN';
  if (r === 'ADMIN') return 'ADMIN';
  return 'STAFF';
}

// GET /api/invites → simple list
export async function GET() {
  try {
    const me = await readSession();
    if (!me) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const rows = await db.select().from(invites);
    return NextResponse.json(rows);
  } catch (err: any) {
    console.error('GET /api/invites error', err);
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 },
    );
  }
}

// POST /api/invites → MUST set token explicitly
export async function POST(req: Request) {
  try {
    const me = await readSession();
    if (!me) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json().catch(() => ({} as any));

    const rawEmail = body?.email;
    const email =
      typeof rawEmail === 'string' && rawEmail.trim().length > 0
        ? rawEmail.trim().toLowerCase()
        : null; // optional

    const role = normaliseRole(body?.role);
    const expiresDays = Number(body?.expiresDays || 7);
    const lang = String(body?.lang || 'en');

    // 🔑 Generate a non-null token
    const token = crypto.randomBytes(16).toString('hex');

    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + Math.max(1, expiresDays) * 86400000,
    );

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/${lang}/join/${token}`;

    // INSERT: explicitly set token so NOT NULL constraint is satisfied
    await db.insert(invites).values({
      token,
      role,
      email,
      createdBy: me.sub ?? null,
      // createdAt / expiresAt / usedAt / usedBy will use DB defaults
      // If your Drizzle schema exposes expiresAt etc., you can also set them here
      expiresAt,
    } as any);

    return NextResponse.json({
      ok: true,
      token,
      url,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err: any) {
    console.error('POST /api/invites error', err);
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 },
    );
  }
}