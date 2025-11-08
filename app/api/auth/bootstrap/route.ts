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

export async function POST() {
  const email = process.env.BOOTSTRAP_SUPERADMIN_EMAIL || "super@example.com";
  const name = process.env.BOOTSTRAP_SUPERADMIN_NAME || "Super Admin";
  const pass = process.env.BOOTSTRAP_SUPERADMIN_PASSWORD || "change-me";

  let [u] = await db
    .select()
    .from(users)
    .where(eq(users.role, "SUPER"))
    .limit(1);

  if (!u) {
    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(pass, 10);
    await db
      .insert(users)
      .values({
        id,
        name,
        email: email.toLowerCase(),
        role: "SUPER",
        passwordHash,
        active: true,
      });
    [u] = await db.select().from(users).where(eq(users.id, id)).limit(1);
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

export async function GET() {
  return POST();
} // optional convenience
