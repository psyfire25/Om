// app/api/invites/[token]/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invites } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { requireRole } from '@/lib/auth';

function normalizeBase(base: string) {
  return base.replace(/\/+$/, '').replace(/\/(en|es|ca|fr|it)(\/)?$/i, '');
}

export async function GET(_: Request, { params }: { params: { token: string } }) {
  const [row] = await db.select().from(invites).where(eq(invites.token, params.token)).limit(1);
  if (!row) return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
  return NextResponse.json(row);
}

// Admin edit (email, role, expiry extension, mark used)
export async function PATCH(req: Request, { params }: { params: { token: string } }) {
  await requireRole('ADMIN');
  const patch = await req.json().catch(() => ({} as any));

  const updateData: any = {
    email: patch.email ?? undefined,
    role: patch.role ?? undefined,
    // extendDays: number → recompute expiresAt from NOW
    expiresAt: typeof patch.extendDays === 'number'
      ? new Date(Date.now() + Math.max(1, patch.extendDays) * 86400000)
      : undefined,
    usedAt: patch.usedAt === null ? null : undefined, // allow clearing usedAt if you want (optional)
    usedBy: patch.usedBy === null ? null : undefined,
  };
  Object.keys(updateData).forEach((k) => updateData[k] === undefined && delete updateData[k]);

  await db.update(invites).set(updateData).where(eq(invites.token, params.token));

  const [row] = await db.select().from(invites).where(eq(invites.token, params.token)).limit(1);
  if (!row) return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
  return NextResponse.json(row);
}

// Revoke
export async function DELETE(_: Request, { params }: { params: { token: string } }) {
  await requireRole('ADMIN');
  await db.delete(invites).where(eq(invites.token, params.token));
  return NextResponse.json({ ok: true });
}