export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projects, tasks } from '@/lib/schema';
import { readSession, requireRole } from '@/lib/auth';
import { and, desc, gte, lte, eq, isNotNull } from 'drizzle-orm';

function parseDate(d?: string|null) {
  if (!d) return null;
  const t = Date.parse(d);
  return Number.isFinite(t) ? new Date(t) : null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const scope = (url.searchParams.get('scope') || 'mine').toLowerCase(); // mine|all
  const from = parseDate(url.searchParams.get('from'));
  const to = parseDate(url.searchParams.get('to'));

  const me = await readSession();
  if (!me) return new NextResponse('Unauthorized', { status: 401 });

  const taskDateCond = and(
    from ? gte(tasks.startDate, from) : undefined,
    to ? lte(tasks.endDate, to) : undefined,
  );
  const projDateCond = and(
    from ? gte(projects.startDate, from) : undefined,
    to ? lte(projects.endDate, to) : undefined,
  );

  const isAdmin = (me.role === 'ADMIN' || me.role === 'SUPER');

  let taskRows;
  if (scope === 'all' && isAdmin) {
    taskRows = await db.select().from(tasks).where(taskDateCond).orderBy(desc(tasks.createdAt));
  } else {
    taskRows = await db.select().from(tasks).where(and(eq(tasks.assigneeId, me.sub), taskDateCond)).orderBy(desc(tasks.createdAt));
  }

  let projectRows: any[] = [];
  if (scope === 'all' && isAdmin) {
    projectRows = await db.select().from(projects).where(and(isNotNull(projects.startDate), projDateCond)).orderBy(desc(projects.createdAt));
  }

  const taskEvents = taskRows
    .filter((x: any) => x.startDate || x.dueDate)
    .map((x: any) => ({
      id: `task:${x.id}`,
      title: x.title,
      start: (x.startDate ?? x.dueDate) as any,
      end: (x.endDate ?? x.dueDate ?? x.startDate) as any,
      allDay: true,
      backgroundColor: x.status === 'DONE' ? '#22c55e' : x.status === 'BLOCKED' ? '#f59e0b' : undefined,
      borderColor: 'transparent',
      extendedProps: { kind: 'task', status: x.status, projectId: x.projectId ?? null, assigneeId: x.assigneeId ?? null },
    }));

  const projectEvents = projectRows.map((x: any) => ({
    id: `project:${x.id}`,
    title: `🗂 ${x.name}`,
    start: (x.startDate ?? x.endDate) as any,
    end: (x.endDate ?? x.startDate) as any,
    allDay: true,
    backgroundColor: '#60a5fa',
    borderColor: 'transparent',
    extendedProps: { kind: 'project', status: x.status },
  }));

  return NextResponse.json([...taskEvents, ...projectEvents]);
}

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.id) return new NextResponse('Missing id', { status: 400 });
  const me = await readSession();
  if (!me) return new NextResponse('Unauthorized', { status: 401 });

  const [kind, realId] = String(body.id).split(':');
  const start = body.start ? new Date(body.start) : null;
  const end = body.end ? new Date(body.end) : start;

  if (kind === 'task') {
    const [row] = await db.select().from(tasks).where(eq(tasks.id, realId)).limit(1);
    if (!row) return new NextResponse('Not Found', { status: 404 });
    const isOwner = row.assigneeId === me.sub;
    const isAdmin = (me.role === 'ADMIN' || me.role === 'SUPER');
    if (!isOwner && !isAdmin) return new NextResponse('Forbidden', { status: 403 });

    await db.update(tasks).set({ startDate: start, endDate: end, updatedAt: new Date() }).where(eq(tasks.id, realId));
    return NextResponse.json({ ok: true });
  }

  if (kind === 'project') {
    await requireRole('ADMIN');
    await db.update(projects).set({ startDate: start, endDate: end, updatedAt: new Date() }).where(eq(projects.id, realId));
    return NextResponse.json({ ok: true });
  }

  return new NextResponse('Bad id', { status: 400 });
}
