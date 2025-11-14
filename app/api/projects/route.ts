// app/api/projects/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projects } from '@/lib/schema';
import { readSession } from '@/lib/auth';
import { desc } from 'drizzle-orm';

function toDate(v: any) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

// GET /api/projects
export async function GET() {
  try {
    const me = await readSession();
    if (!me) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const rows = await db
      .select()
      .from(projects)
      .orderBy(desc(projects.createdAt));

    return NextResponse.json(rows);
  } catch (err: any) {
    console.error('GET /api/projects error', err);
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 },
    );
  }
}

// POST /api/projects
export async function POST(req: Request) {
  try {
    const me = await readSession();
    if (!me) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json().catch(() => ({} as any));

    const name = String(body?.name || '').trim();
    const description = body?.description ?? null;
    const status = (body?.status as string) || 'PLANNING';
    const startDate = toDate(body?.startDate);
    const endDate = toDate(body?.endDate);

    if (!name) {
      // Don’t hit the DB with invalid data – return a 400 instead of 500
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 },
      );
    }

    const id = crypto.randomUUID();

    await db.insert(projects).values({
      id,
      name,
      description,
      status,
      startDate,
      endDate,
      // createdAt / updatedAt default in DB
    });

    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    console.error('POST /api/projects error', err);
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 },
    );
  }
}