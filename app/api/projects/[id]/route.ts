// app/api/projects/[id]/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projects } from '@/lib/schema';
import { eq } from 'drizzle-orm';

function toDate(v: any) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const [row] = await db.select().from(projects).where(eq(projects.id, params.id)).limit(1);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const patch = await req.json().catch(() => ({} as any));

  const updateData: any = {
    name: patch.name,
    description: patch.description,
    status: patch.status,                       // 'PLANNING' | 'ACTIVE' | 'BLOCKED' | 'DONE'
    startDate: toDate(patch.startDate),
    endDate: toDate(patch.endDate),
    updatedAt: new Date(),
  };
  // remove undefined so only provided fields are updated
  Object.keys(updateData).forEach((k) => updateData[k] === undefined && delete updateData[k]);

  await db.update(projects).set(updateData).where(eq(projects.id, params.id));

  const [row] = await db.select().from(projects).where(eq(projects.id, params.id)).limit(1);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  // optional: verify exists first
  const [row] = await db.select().from(projects).where(eq(projects.id, params.id)).limit(1);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await db.delete(projects).where(eq(projects.id, params.id));
  return NextResponse.json({ ok: true });
}