// 👇 prevent build-time prerender/export for this route
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { sessionCookieOptionsFromHost } from "@/lib/cookies";
export async function POST() {
  const host = headers().get("host") || "";
  const res = NextResponse.json({ ok: true });
  res.cookies.set("session", "", {
    ...sessionCookieOptionsFromHost(host),
    maxAge: 0,
  });
  return res;
}
