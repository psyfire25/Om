
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/schema';
import { readSession } from '@/lib/auth';
import { desc } from 'drizzle-orm';

function toDate(v:any){ if(!v) return null; const d=new Date(v); return isNaN(d.getTime())?null:d; }

export async function GET() {
  const me = await readSession();
  if(!me) return new NextResponse('Unauthorized', { status: 401 });
  const rows = await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const me = await readSession();
  if(!me) return new NextResponse('Unauthorized', { status: 401 });
  const body = await req.json().catch(()=>null);
  const id = crypto.randomUUID();
  await db.insert(tasks).values({
    id,
    title: String(body?.title||'').trim(),
    description: body?.description||null,
    status: body?.status||'PENDING',
    projectId: body?.projectId||null,
    assigneeId: body?.assigneeId||null,
    startDate: toDate(body?.startDate),
    endDate: toDate(body?.endDate),
    dueDate: toDate(body?.dueDate),
  });
  return NextResponse.json({ ok: true, id });
}
