import { cookies } from "next/headers";
import { SignJWT } from "jose";

const alg = "HS256";
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");

/**
 * Signs a new session JWT and sets it as a cookie
 */
export async function signSession(payload: {
  sub: string;
  email: string;
  role: string;
}) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  // set cookie
  cookies().set({
    name: "session",
    value: token,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60,
  });

  return token;
}