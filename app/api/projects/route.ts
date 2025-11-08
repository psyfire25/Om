export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth";

export async function GET() {
  await requireRole("STAFF");
  const rows = await db
    .select()
    .from(projects)
    .orderBy(desc(projects.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  await requireRole("ADMIN");
  const b = await req.json().catch(() => null);
  if (!b?.name) return new NextResponse("Missing name", { status: 400 });

  const id = crypto.randomUUID();
  const now = new Date();

  await db.insert(projects).values({
    id,
    name: b.name,
    description: b.description ?? null,
    status: b.status ?? "PLANNING",
    startDate: b.startDate ? new Date(b.startDate) : null,
    endDate: b.endDate ? new Date(b.endDate) : null,
    createdAt: now,
    updatedAt: now,
  });

  const [row] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);
  return NextResponse.json(row, { status: 201 });
}
