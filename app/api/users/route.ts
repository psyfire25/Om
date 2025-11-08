export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  await requireRole("ADMIN");
  const rows = await db.select().from(users).orderBy(desc(users.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  await requireRole("ADMIN");
  const b = await req.json().catch(() => null);
  if (!b?.email || !b?.name || !b?.password || !b?.role) {
    return new NextResponse("Missing fields", { status: 400 });
  }
  const email = String(b.email).toLowerCase().trim();

  const exists = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (exists[0])
    return new NextResponse("User already exists", { status: 409 });

  const id = crypto.randomUUID();
  const hash = await bcrypt.hash(String(b.password), 10);
  const now = new Date();

  await db.insert(users).values({
    id,
    name: b.name,
    email,
    role: b.role,
    passwordHash: hash,
    active: true,
    createdAt: now,
    updatedAt: now,
  });

  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return NextResponse.json(row, { status: 201 });
}
