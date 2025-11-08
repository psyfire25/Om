// lib/cookies.ts (no imports from next/*)
export function sessionCookieOptionsFromHost(host: string) {
  const isCSB = host.endsWith(".csb.app"); // iframe-friendly in CodeSandbox
  return {
    httpOnly: true,
    sameSite: isCSB ? "none" : "lax",
    secure: isCSB ? true : process.env.NODE_ENV === "production",
    path: "/",
  } as const;
}
