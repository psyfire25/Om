// 👇 prevent build-time prerender/export for this route
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// app/api/invites/route.ts
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";
import { defaultLocale } from "@/lib/i18n";

function normalizeBase(base: string) {
  // strip trailing slashes and any trailing /{lang}
  return base.replace(/\/+$/, "").replace(/\/(en|es|ca|fr|it)(\/)?$/i, "");
}

export async function POST(req: Request) {
  const me = await requireRole("SUPER");
  const body = await req.json().catch(() => null);
  const role = body?.role || "STAFF";
  const email = body?.email || undefined;
  const days = Number(body?.expiresDays || 7);
  const lang = (body?.lang || defaultLocale) as string;

  const token = crypto.randomUUID();
  const now = new Date();
  const invite = {
    token,
    role,
    email,
    createdBy: me.sub,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + days * 86400000).toISOString(),
  };
  db.data.invites.push(invite as any);
  db.write();

  // Prefer the request origin; fallback to BASE_URL if set
  const origin = new URL(req.url).origin;
  const baseEnv = process.env.BASE_URL || origin;
  const base = normalizeBase(baseEnv);

  return NextResponse.json({
    token,
    url: `${base}/${lang}/invite/${token}`,
  });
}
