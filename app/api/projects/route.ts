
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projects } from '@/lib/schema';
import { readSession, requireRole } from '@/lib/auth';
import { desc } from 'drizzle-orm';

function toDate(v:any){ if(!v) return null; const d=new Date(v); return isNaN(d.getTime())?null:d; }

export async function GET() {
  const me = await readSession();
  if(!me) return new NextResponse('Unauthorized', { status: 401 });
  const rows = await db.select().from(projects).orderBy(desc(projects.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  await requireRole('ADMIN');
  const body = await req.json().catch(()=>null);
  const id = crypto.randomUUID();
  await db.insert(projects).values({
    id,
    name: String(body?.name||'').trim(),
    description: body?.description||null,
    status: body?.status||'PLANNING',
    startDate: toDate(body?.startDate),
    endDate: toDate(body?.endDate),
  });
  return NextResponse.json({ ok: true, id });
}
