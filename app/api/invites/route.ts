
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invites } from '@/lib/schema';
import { requireRole, readSession } from '@/lib/auth';
import { defaultLocale } from '@/lib/i18n';

function normalizeBase(base: string) {
  return base.replace(/\/+$/, '').replace(/\/(en|es|ca|fr|it)(\/)?$/i, '');
}

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
