// lib/auth.ts
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export type Role = "SUPER" | "ADMIN" | "STAFF" | "GUARD";

export type SessionClaims = {
  sub: string; // user id
  email: string;
  role: Role;
  name?: string | null;
} & JWTPayload;

const alg = "HS256";
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-me"
);

// Password helpers
export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}
export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

// Create a signed JWT for the session cookie
export async function signSession(claims: SessionClaims) {
  const now = Math.floor(Date.now() / 1000);
  return await new SignJWT(claims)
    .setProtectedHeader({ alg })
    .setIssuedAt(now)
    .setExpirationTime(now + 60 * 60 * 24 * 7) // 7 days
    .sign(secret);
}

// Read & verify session cookie; returns claims or null
export async function readSession(): Promise<SessionClaims | null> {
  try {
    const token = cookies().get("session")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret, { algorithms: [alg] });
    // minimal shape guard
    if (!payload || typeof payload !== "object") return null;
    if (!payload.sub || !payload.email || !payload.role) return null;
    return payload as SessionClaims;
  } catch {
    return null;
  }
}

// Require a minimum role; returns claims if authorized, otherwise throws 401
export async function requireRole(min: Role): Promise<SessionClaims> {
  const s = await readSession();
  if (!s) throw new NextResponse("Unauthorized", { status: 401 });

  const rank: Record<Role, number> = {
    SUPER: 3,
    ADMIN: 2,
    STAFF: 1,
    GUARD: 0,
  };
  if (rank[s.role as Role] < rank[min]) {
    throw new NextResponse("Forbidden", { status: 403 });
  }
  return s;
}
