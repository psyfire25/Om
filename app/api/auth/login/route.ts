export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signSession } from "@/lib/auth";
import { sessionCookieOptionsFromHost } from "@/lib/cookies";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return new NextResponse("Missing credentials", { status: 400 });
  }

  const email = String(body.email).toLowerCase();
  const [u] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!u || !u.active) return new NextResponse("Unauthorized", { status: 401 });
  const ok = await bcrypt.compare(String(body.password), u.passwordHash);
  if (!ok) return new NextResponse("Unauthorized", { status: 401 });

  const token = await signSession({
    sub: u.id,
    email: u.email,
    role: u.role,
    name: u.name,
  } as any);
  const host = headers().get("host") || "";
  const res = NextResponse.json({ ok: true });
  res.cookies.set("session", token, sessionCookieOptionsFromHost(host));
  return res;
}
