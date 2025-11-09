// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["en", "es", "ca", "fr", "it"] as const;

function getLang(pathname: string): string {
  const m = pathname.match(/^\/(en|es|ca|fr|it)(?:\/|$)/i);
  return (m?.[1] || "en").toLowerCase();
}

function isLocalePath(pathname: string) {
  return LOCALES.some(
    (l) => pathname === "/" + l || pathname.startsWith("/" + l + "/")
  );
}

function isOpenApi(pathname: string) {
  // public auth + invite endpoints
  if (
    pathname === "/api/auth/login" ||
    pathname === "/api/auth/logout" ||
    pathname === "/api/auth/bootstrap"
  ) return true;

  // Accept invite (GET + POST on /api/invites/[token]) stays open
  if (pathname.startsWith("/api/invites/")) return true;

  return false;
}

function isProtectedApi(pathname: string) {
  return pathname.startsWith("/api") && !isOpenApi(pathname);
}

function isProtectedPage(pathname: string) {
  const lang = getLang(pathname);
  const protectedPrefixes = [
    `/${lang}/admin`,
    `/${lang}/dashboard`,
    `/${lang}/schedule`,
  ];
  return protectedPrefixes.some((p) => pathname.startsWith(p));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 0) Always allow OPTIONS (CORS / preflights) for APIs
  if (req.method === "OPTIONS" && pathname.startsWith("/api")) {
    return new NextResponse(null, { status: 204 });
  }

  // 1) Redirect root to /en
  if (pathname === "/" || pathname === "") {
    const url = req.nextUrl.clone();
    url.pathname = "/en";
    return NextResponse.redirect(url);
  }

  // 2) Allow Next internals / static
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 3) Guard APIs with cookie (except open endpoints)
  const token = req.cookies.get("session")?.value || null;

  if (isProtectedApi(pathname)) {
    if (!token) return new NextResponse("Unauthorized", { status: 401 });
    return NextResponse.next();
  }

  // 4) Ensure locale prefix for app routes (non-API)
  if (!isLocalePath(pathname) && !pathname.startsWith("/api")) {
    const url = req.nextUrl.clone();
    url.pathname = "/en";
    return NextResponse.redirect(url);
  }

  // 5) Page-level protection: redirect unauthenticated users to /[lang]/login
  if (isProtectedPage(pathname) && !token) {
    const lang = getLang(pathname);
    const url = req.nextUrl.clone();
    url.pathname = `/${lang}/login`;
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // 6) QoL: already signed in and hitting /[lang]/login -> send to dashboard
  if (token) {
    const m = pathname.match(/^\/(en|es|ca|fr|it)\/login\/?$/i);
    if (m) {
      const lang = m[1].toLowerCase();
      const url = req.nextUrl.clone();
      url.pathname = `/${lang}/dashboard`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};