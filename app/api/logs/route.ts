// Force runtime on edge-hosted platforms
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logs } from '@/lib/schema';
import { desc } from 'drizzle-orm';
import { currentUser } from '@/lib/auth';

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/logs → list latest logs
export async function GET() {
  const rows = await db
    .select()
    .from(logs)
    .orderBy(desc(logs.createdAt))
    .limit(500);
  return json(rows);
}

// POST /api/logs → create a log entry
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const text = String(body?.text || '').trim();
  if (!text) return new NextResponse('Missing text', { status: 400 });

  // Optional fields coming from the client form
  const authorLabel = (body?.author ? String(body.author) : '').trim();
  const weather = (body?.weather ? String(body.weather) : '').trim() || null;
  const projectId = body?.projectId || null;
  const taskId = body?.taskId || null;

  // If the client supplies a date, allow overriding createdAt
  let createdAt: Date | undefined;
  if (body?.date) {
    const d = new Date(body.date);
    if (!isNaN(d.getTime())) createdAt = d;
  }

  // Attach the current user when available (for authorId) and fall back to label
  const me = await currentUser().catch(() => null);
  const authorId = me?.id ?? null;
  const author = authorLabel || me?.name || null;

  const [inserted] = await db
    .insert(logs)
    .values({
      // id: auto (uuid default)
      text,
      author,        // varchar(120) | null
      authorId,      // uuid | null
      weather,       // varchar(64) | null
      projectId,     // uuid | null
      taskId,        // uuid | null
      ...(createdAt ? { createdAt } : {}), // only set if provided/valid
    })
    .returning();

  return json(inserted, 201);
}