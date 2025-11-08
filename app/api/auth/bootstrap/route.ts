import { db } from "@/lib/db";
import { hashPassword, signSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { sessionCookieOptions } from "@/lib/cookies";

export async function POST() {
  if (db.data.users.find((u) => u.role === "SUPER"))
    return new NextResponse("Already bootstrapped", { status: 400 });
  const email = process.env.BOOTSTRAP_SUPERADMIN_EMAIL || "super@example.com";
  const name = process.env.BOOTSTRAP_SUPERADMIN_NAME || "Super Admin";
  const password = process.env.BOOTSTRAP_SUPERADMIN_PASSWORD || "change-me";
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();
  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    role: "SUPER",
    passwordHash,
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  db.data.users.push(user as any);
  db.write();
  const token = await signSession(user as any);
  const res = NextResponse.json({ ok: true });
  res.cookies.set("session", token, sessionCookieOptions());
  return res;
}
export async function GET() {
  return POST();
}
