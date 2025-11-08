export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { materials } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth";

export async function GET() {
  await requireRole("STAFF");
  const rows = await db
    .select()
    .from(materials)
    .orderBy(desc(materials.updatedAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  await requireRole("STAFF");
  const b = await req.json().catch(() => null);
  if (!b?.name) return new NextResponse("Missing name", { status: 400 });

  const id = crypto.randomUUID();
  const now = new Date();

  await db.insert(materials).values({
    id,
    name: b.name,
    sku: b.sku ?? null,
    quantity: Number.isFinite(b.quantity) ? Number(b.quantity) : 0,
    unit: b.unit ?? "pcs",
    location: b.location ?? null,
    notes: b.notes ?? null,
    createdAt: now,
    updatedAt: now,
  });

  const [row] = await db
    .select()
    .from(materials)
    .where(eq(materials.id, id))
    .limit(1);
  return NextResponse.json(row, { status: 201 });
}
