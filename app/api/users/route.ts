// 👇 prevent build-time prerender/export for this route
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";
export async function GET() {
  await requireRole("SUPER");
  return NextResponse.json(
    db.data.users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      active: u.active,
    }))
  );
}
