// app/api/materials/[id]/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { materials } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const [row] = await db.select().from(materials).where(eq(materials.id, params.id)).limit(1);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const patch = await req.json().catch(() => ({} as any));

  const updateData: any = {
    name: patch.name,
    sku: patch.sku,
    quantity: patch.quantity !== undefined ? Number(patch.quantity) : undefined,
    unit: patch.unit,
    location: patch.location,
    notes: patch.notes,
    updatedAt: new Date(),
  };
  Object.keys(updateData).forEach((k) => updateData[k] === undefined && delete updateData[k]);

  await db.update(materials).set(updateData).where(eq(materials.id, params.id));

  const [row] = await db.select().from(materials).where(eq(materials.id, params.id)).limit(1);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const [row] = await db.select().from(materials).where(eq(materials.id, params.id)).limit(1);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await db.delete(materials).where(eq(materials.id, params.id));
  return NextResponse.json({ ok: true });
}