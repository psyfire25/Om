// app/api/logs/[id]/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logs } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const [row] = await db.select().from(logs).where(eq(logs.id, params.id)).limit(1);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const patch = await req.json().catch(() => ({} as any));
  const updateData: any = {
    text: patch.text,
    level: patch.level,
    authorId: patch.authorId,
    projectId: patch.projectId,
    taskId: patch.taskId,
    // if you want to allow overriding createdAt:
    createdAt: patch.createdAt ? new Date(patch.createdAt) : undefined,
  };
  // remove undefined keys so Drizzle only updates provided fields
  Object.keys(updateData).forEach((k) => updateData[k] === undefined && delete updateData[k]);

  const res = await db.update(logs).set(updateData).where(eq(logs.id, params.id));
  // res.rowCount is not available in neon-http; just re-read the row:
  const [row] = await db.select().from(logs).where(eq(logs.id, params.id)).limit(1);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  // check existence (optional, but nicer errors)
  const [row] = await db.select().from(logs).where(eq(logs.id, params.id)).limit(1);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await db.delete(logs).where(eq(logs.id, params.id));
  return NextResponse.json({ ok: true });
}