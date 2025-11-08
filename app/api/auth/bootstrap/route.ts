// app/api/auth/bootstrap/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { hashPassword, signSession } from "@/lib/auth";
import { sessionCookieOptionsFromHost } from "@/lib/cookies";
import { headers } from "next/headers";

export async function POST() {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.role, "SUPER"))
    .limit(1);
  let u = existing[0];

  if (!u) {
    const id = crypto.randomUUID();
    const email = process.env.BOOTSTRAP_SUPERADMIN_EMAIL || "super@example.com";
    const name = process.env.BOOTSTRAP_SUPERADMIN_NAME || "Super Admin";
    const pass = process.env.BOOTSTRAP_SUPERADMIN_PASSWORD || "change-me";
    const passwordHash = await hashPassword(pass);

    await db.insert(users).values({
      id,
      name,
      email,
      role: "SUPER",
      passwordHash,
      active: true,
    });
    const got = await db.select().from(users).where(eq(users.id, id)).limit(1);
    u = got[0];
  }

  const token = await signSession({
    sub: u.id,
    email: u.email,
    role: u.role,
    name: u.name,
  } as any);

  const host = headers().get("host") || "";
  const res = NextResponse.json({ ok: true, signedInAs: u.email });
  res.cookies.set("session", token, sessionCookieOptionsFromHost(host));
  return res;
}
