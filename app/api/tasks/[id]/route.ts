
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/schema';
import { eq } from 'drizzle-orm';

function toDate(v:any){ if(!v) return null; const d=new Date(v); return isNaN(d.getTime())?null:d; }

export async function GET(_:Request, { params }:{ params:{ id:string } }) {
  const [row] = await db.select().from(tasks).where(eq(tasks.id, params.id)).limit(1);
  if(!row) return new NextResponse('Not Found', { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(()=>null);
  const patch: any = {
    title: body?.title,
    description: body?.description,
    status: body?.status,
    projectId: body?.projectId,
    assigneeId: body?.assigneeId,
    startDate: toDate(body?.startDate),
    endDate: toDate(body?.endDate),
    dueDate: toDate(body?.dueDate),
    time: body?.time,
    updatedAt: new Date(),
  };
  Object.keys(patch).forEach(k => patch[k]===undefined && delete patch[k]);
  await db.update(tasks).set(patch).where(eq(tasks.id, params.id));
  const [row] = await db.select().from(tasks).where(eq(tasks.id, params.id)).limit(1);
  return NextResponse.json(row);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await db.delete(tasks).where(eq(tasks.id, params.id));
  return NextResponse.json({ ok:true });
}
