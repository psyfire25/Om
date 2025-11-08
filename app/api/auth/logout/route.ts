import { NextResponse } from "next/server";
import { sessionCookieOptions } from "@/lib/cookies";
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("session", "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  return res;
}
