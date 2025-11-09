
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logs } from '@/lib/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  const rows = await db.select().from(logs).orderBy(desc(logs.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json().catch(()=>null);
  const id = crypto.randomUUID();
  await db.insert(logs).values({
    id,
    text: String(body?.text||'').trim(),
    level: body?.level||'INFO',
    authorId: body?.author||null,
    projectId: body?.projectId||null,
    taskId: body?.taskId||null,
    createdAt: body?.date ? new Date(body.date) : new Date(),
  });
  return NextResponse.json({ ok: true, id });
}
