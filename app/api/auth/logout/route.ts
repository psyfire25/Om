export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { sessionCookieOptionsFromHost } from "@/lib/cookies";
import { headers } from "next/headers";

export async function POST() {
  const host = headers().get("host") || "";
  const res = NextResponse.json({ ok: true });
  // Clear cookie (match attributes used when setting it)
  res.cookies.set("session", "", {
    ...sessionCookieOptionsFromHost(host),
    maxAge: 0,
  });
  return res;
}
