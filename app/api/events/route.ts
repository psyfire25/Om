// app/api/events/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projects, tasks } from '@/lib/schema';
import { readSession } from '@/lib/auth';

type CalendarEvent = {
  id: string;
  kind: 'project' | 'task';
  refId: string;
  title: string;
  start: string;
  end: string | null;
  allDay: boolean;
  source: 'project' | 'task';
  extendedProps?: Record<string, any>;
};

function toIso(v: any | null | undefined): string | null {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export async function GET(_req: Request) {
  // Golden rule: NEVER 500 from here. Worst case: return [].
  try {
    // Auth: if session fails or no user, we just return no events
    try {
      const me = await readSession();
      if (!me) {
        return NextResponse.json<CalendarEvent[]>([]);
      }
    } catch (e) {
      console.error('readSession failed in /api/events', e);
      return NextResponse.json<CalendarEvent[]>([]);
    }

    let events: CalendarEvent[] = [];

    try {
      const [projectRows, taskRows] = await Promise.all([
        db.select().from(projects),
        db.select().from(tasks),
      ]);

      // Projects → events
      for (const p of projectRows as any[]) {
        const startIso =
          toIso(p.startDate) ?? toIso(p.createdAt) ?? null;
        if (!startIso) continue;

        const endIso = toIso(p.endDate);

        events.push({
          id: `project:${p.id}`,
          kind: 'project',
          refId: p.id,
          title: p.name ?? 'Project',
          start: startIso,
          end: endIso,
          allDay: true,
          source: 'project',
          extendedProps: {
            kind: 'project',
            status: p.status,
          },
        });
      }

      // Tasks → events
      for (const t of taskRows as any[]) {
        const startIso =
          toIso(t.startDate) ?? toIso(t.dueDate) ?? toIso(t.createdAt) ?? null;
        if (!startIso) continue;

        const endIso =
          toIso(t.endDate) ?? toIso(t.dueDate) ?? null;

        events.push({
          id: `task:${t.id}`,
          kind: 'task',
          refId: t.id,
          title: t.title ?? 'Task',
          start: startIso,
          end: endIso,
          allDay: !t.time,
          source: 'task',
          extendedProps: {
            kind: 'task',
            status: t.status,
            projectId: t.projectId ?? null,
            assigneeId: t.assigneeId ?? null,
          },
        });
      }
    } catch (e) {
      console.error('DB error in /api/events, returning []', e);
      events = [];
    }

    return NextResponse.json(events);
  } catch (err) {
    console.error('Unexpected /api/events error, returning []', err);
    return NextResponse.json<CalendarEvent[]>([]);
  }
}