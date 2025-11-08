export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logs } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { requireRole, readSession } from "@/lib/auth";

export async function GET() {
  await requireRole("STAFF");
  const rows = await db.select().from(logs).orderBy(desc(logs.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  await requireRole("STAFF");
  const b = await req.json().catch(() => null);
  if (!b?.text) return new NextResponse("Missing text", { status: 400 });

  const id = crypto.randomUUID();
  const me = await readSession(); // for authorId if available
  const now = new Date();

  await db.insert(logs).values({
    id,
    text: b.text,
    authorId: me?.sub ?? null,
    projectId: b.projectId ?? null,
    taskId: b.taskId ?? null,
    level: b.level ?? "INFO",
    createdAt: now,
  });

  const [row] = await db.select().from(logs).where(eq(logs.id, id)).limit(1);
  return NextResponse.json(row, { status: 201 });
}
