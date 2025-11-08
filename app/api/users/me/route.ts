// app/api/users/me/route.ts

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const s = await readSession();
  if (!s) return new NextResponse("Unauthorized", { status: 401 });

  // pull the latest user record (to include `active`, updated name, role changes, etc.)
  const [u] = await db.select().from(users).where(eq(users.id, s.sub)).limit(1);
  if (!u) return new NextResponse("Unauthorized", { status: 401 });

  return NextResponse.json({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    active: u.active,
  });
}
