export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/schema';
import { readSession } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';

function toDate(v: any) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

// GET /api/tasks[?projectId=...]
export async function GET(req: Request) {
  try {
    const me = await readSession();
    if (!me) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId');

    let rows;

    if (projectId) {
      // tasks for a specific project
      rows = await db
        .select()
        .from(tasks)
        .where(eq(tasks.projectId, projectId))
        .orderBy(desc(tasks.createdAt));
    } else {
      // all tasks
      rows = await db
        .select()
        .from(tasks)
        .orderBy(desc(tasks.createdAt));
    }

    return NextResponse.json(rows);
  } catch (err: any) {
    console.error('GET /api/tasks error', err);
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const me = await readSession();
    if (!me) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const id = crypto.randomUUID();

    await db.insert(tasks).values({
      id,
      title: String(body?.title || '').trim(),
      description: body?.description || null,
      status: body?.status || 'PENDING',
      projectId: body?.projectId || null,
      assigneeId: body?.assigneeId || null,
      startDate: toDate(body?.startDate),
      endDate: toDate(body?.endDate),
      dueDate: toDate(body?.dueDate),
      time: body?.time || null,
    });

    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    console.error('POST /api/tasks error', err);
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 },
    );
  }
}