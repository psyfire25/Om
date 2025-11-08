export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth";

export async function GET() {
  await requireRole("STAFF"); // or ADMIN
  const rows = await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  await requireRole("STAFF"); // or ADMIN
  const body = await req.json().catch(() => null);
  if (!body?.title) return new NextResponse("Missing title", { status: 400 });

  const now = new Date();
  const id = crypto.randomUUID();

  await db.insert(tasks).values({
    id,
    title: body.title,
    description: body.description ?? null,
    status: body.status ?? "PENDING",
    projectId: body.projectId ?? null,
    startDate: body.startDate ? new Date(body.startDate) : null,
    endDate: body.endDate ? new Date(body.endDate) : null,
    dueDate: body.dueDate ? new Date(body.dueDate) : null,
    createdAt: now,
    updatedAt: now,
  });

  const [row] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return NextResponse.json(row, { status: 201 });
}
