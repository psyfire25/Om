// lib/cookies.ts
import { headers } from "next/headers";

export function sessionCookieOptions() {
  const host = headers().get("host") || "";
  const isCSB = host.endsWith(".csb.app"); // iframe/third-party context in CSB
  return {
    httpOnly: true,
    sameSite: isCSB ? "none" : "lax",
    secure: isCSB ? true : process.env.NODE_ENV === "production",
    path: "/",
  } as const;
}
