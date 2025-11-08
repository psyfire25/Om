export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invites, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signSession } from "@/lib/auth";
import { sessionCookieOptionsFromHost } from "@/lib/cookies";
import { headers } from "next/headers";

export async function GET(
  _: Request,
  { params }: { params: { token: string } }
) {
  const [inv] = await db
    .select()
    .from(invites)
    .where(eq(invites.token, params.token))
    .limit(1);
  if (!inv)
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  if (inv.usedAt)
    return NextResponse.json({ error: "Invite already used" }, { status: 400 });
  if (inv.expiresAt && new Date(inv.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Invite expired" }, { status: 400 });
  }
  return NextResponse.json({
    token: inv.token,
    email: inv.email ?? null,
    role: inv.role,
  });
}

export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  const body = await req.json().catch(() => null);
  const name = body?.name?.toString().trim();
  const email = body?.email?.toString().toLowerCase().trim();
  const password = body?.password?.toString();
  if (!name || !email || !password)
    return new NextResponse("Missing fields", { status: 400 });

  const [inv] = await db
    .select()
    .from(invites)
    .where(eq(invites.token, params.token))
    .limit(1);
  if (!inv)
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  if (inv.usedAt)
    return NextResponse.json({ error: "Invite already used" }, { status: 400 });
  if (inv.expiresAt && new Date(inv.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Invite expired" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing[0])
    return NextResponse.json({ error: "User already exists" }, { status: 409 });

  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);

  await db
    .insert(users)
    .values({ id, name, email, role: inv.role, passwordHash, active: true });
  await db
    .update(invites)
    .set({ usedAt: new Date(), usedBy: id })
    .where(eq(invites.token, params.token));

  const token = await signSession({
    sub: id,
    email,
    role: inv.role,
    name,
  } as any);
  const host = headers().get("host") || "";
  const res = NextResponse.json({ ok: true });
  res.cookies.set("session", token, sessionCookieOptionsFromHost(host));
  return res;
}
