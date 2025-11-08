export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { materials } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await requireRole("STAFF");
  const [row] = await db
    .select()
    .from(materials)
    .where(eq(materials.id, params.id))
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
    name: b.name,
    sku: b.sku ?? null,
    quantity: Number.isFinite(b.quantity) ? Number(b.quantity) : undefined,
    unit: b.unit,
    location: b.location ?? null,
    notes: b.notes ?? null,
    updatedAt: new Date(),
  };
  Object.keys(update).forEach(
    (k) => update[k] === undefined && delete update[k]
  );

  const res = await db
    .update(materials)
    .set(update)
    .where(eq(materials.id, params.id))
    .returning();
  if (res.length === 0) return new NextResponse("Not Found", { status: 404 });
  return NextResponse.json(res[0]);
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  await requireRole("STAFF");
  const res = await db
    .delete(materials)
    .where(eq(materials.id, params.id))
    .returning();
  if (res.length === 0) return new NextResponse("Not Found", { status: 404 });
  return NextResponse.json({ ok: true });
}
