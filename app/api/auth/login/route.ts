import { db } from "@/lib/db";
import { verifyPassword, signSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { sessionCookieOptions } from "@/lib/cookies";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password)
    return new NextResponse("Missing credentials", { status: 400 });
  const user = db.data.users.find(
    (u) => u.email.toLowerCase() === String(body.email).toLowerCase()
  );
  if (!user || !user.active)
    return new NextResponse("Invalid login", { status: 401 });
  const ok = await verifyPassword(body.password, user.passwordHash);
  if (!ok) return new NextResponse("Invalid login", { status: 401 });
  const token = await signSession(user as any);
  const res = NextResponse.json({ ok: true });
  res.cookies.set("session", token, sessionCookieOptions());
  return res;
}
