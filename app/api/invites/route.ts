// app/api/invites/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invites, users } from '@/lib/schema';
import { requireRole, readSession } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';
import { defaultLocale } from '@/lib/i18n';

function normalizeBase(base: string) {
  return base.replace(/\/+$/, '').replace(/\/(en|es|ca|fr|it)(\/)?$/i, '');
}

// ✅ LIST invites (ADMIN/SUPER)
export async function GET() {
  await requireRole('ADMIN');
  const rows = await db
    .select({
      token: invites.token,
      email: invites.email,
      role: invites.role,
      createdBy: invites.createdBy,
      createdAt: invites.createdAt,
      expiresAt: invites.expiresAt,
      usedAt: invites.usedAt,
      usedBy: invites.usedBy,
    })
    .from(invites)
    .orderBy(desc(invites.createdAt));

  // (Optional) resolve creator name
  // const creators = await db.select({ id: users.id, name: users.name }).from(users);
  // map if you want names

  return NextResponse.json(rows);
}

// ✅ CREATE invite
export async function POST(req: Request) {
  await requireRole('ADMIN');
  const me = await readSession();
  const body = await req.json().catch(() => null);
  const role = body?.role || 'STAFF';
  const email = body?.email || null;
  const days = Number(body?.expiresDays || 7);
  const lang = (body?.lang || defaultLocale) as string;

  const token = crypto.randomUUID();
  const now = new Date();
  await db.insert(invites).values({
    token,
    role,
    email,
    createdBy: me!.sub,
    createdAt: now,
    expiresAt: new Date(now.getTime() + days * 86400000),
  });

  const origin = new URL(req.url).origin;
  const baseEnv = process.env.BASE_URL || origin;
  const base = normalizeBase(baseEnv);

  return NextResponse.json({ token, url: `${base}/${lang}/invite/${token}` });
}