// app/api/invites/route.ts

// 👇 prevent build-time prerender/export for this route
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invites } from "@/lib/schema";
import { requireRole } from "@/lib/auth";
import { defaultLocale } from "@/lib/i18n";

function normalizeBase(base: string) {
  // strip trailing slashes and any trailing /{lang}
  return base.replace(/\/+$/, "").replace(/\/(en|es|ca|fr|it)(\/)?$/i, "");
}

export async function POST(req: Request) {
  // must be SUPER to create invites
  const me = await requireRole("SUPER");

  const body = await req.json().catch(() => null as any);
  const role = body?.role || "STAFF";
  const email: string | null = body?.email ? String(body.email) : null;
  const days = Number(body?.expiresDays ?? 7);
  const lang = String(body?.lang || defaultLocale);

  const token = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + days * 86400000);

  // write to Postgres (Neon) via Drizzle
  await db.insert(invites).values({
    token,
    role,
    email,
    createdBy: me.sub, // issuer user id from your session
    createdAt: now,
    expiresAt,
    // usedAt / usedBy remain null until consumed
  });

  // Prefer the request origin; fallback to BASE_URL if set
  const origin = new URL(req.url).origin;
  const baseEnv = process.env.BASE_URL || origin;
  const base = normalizeBase(baseEnv);

  return NextResponse.json({
    token,
    url: `${base}/${lang}/invite/${token}`,
  });
}
