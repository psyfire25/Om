export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await requireRole("STAFF");
  const [row] = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, params.id))
    .limit(1);
  if (!row) return new NextResponse("Not Found", { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  await requireRole("STAFF");
  const b = await req.json().catch(() => ({} as any));
  const update: any = {
    title: b.title,
    description: b.description ?? null,
    status: b.status,
    projectId: b.projectId ?? null,
    assigneeId: b.assigneeId ?? null,
    startDate: b.startDate ? new Date(b.startDate) : null,
    endDate: b.endDate ? new Date(b.endDate) : null,
    dueDate: b.dueDate ? new Date(b.dueDate) : null,
    priority: Number.isFinite(b.priority) ? Number(b.priority) : undefined,
    updatedAt: new Date(),
  };
  Object.keys(update).forEach(
    (k) => update[k] === undefined && delete update[k]
  );

  const res = await db
    .update(tasks)
    .set(update)
    .where(eq(tasks.id, params.id))
    .returning();
  if (res.length === 0) return new NextResponse("Not Found", { status: 404 });
  return NextResponse.json(res[0]);
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  await requireRole("STAFF");
  const res = await db.delete(tasks).where(eq(tasks.id, params.id)).returning();
  if (res.length === 0) return new NextResponse("Not Found", { status: 404 });
  return NextResponse.json({ ok: true });
}
