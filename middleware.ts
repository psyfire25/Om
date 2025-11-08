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
  return (
    pathname === "/api/auth/login" ||
    pathname === "/api/auth/logout" ||
    pathname === "/api/auth/bootstrap" ||
    pathname.startsWith("/api/invites/")
  );
}

function isProtectedApi(pathname: string) {
  return pathname.startsWith("/api") && !isOpenApi(pathname);
}

function isProtectedPage(pathname: string) {
  const lang = getLang(pathname);
  const prefixes = [
    `/${lang}/admin`,
    `/${lang}/dashboard`,
    `/${lang}/schedule`,
  ];
  return prefixes.some((p) => pathname.startsWith(p));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // root -> /en
  if (pathname === "/" || pathname === "") {
    const url = req.nextUrl.clone();
    url.pathname = "/en";
    return NextResponse.redirect(url);
  }

  // allow static
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("session")?.value || null;

  // APIs
  if (isProtectedApi(pathname)) {
    if (!token) return new NextResponse("Unauthorized", { status: 401 });
    return NextResponse.next();
  }

  // ensure locale prefix
  if (!isLocalePath(pathname) && !pathname.startsWith("/api")) {
    const url = req.nextUrl.clone();
    url.pathname = "/en";
    return NextResponse.redirect(url);
  }

  // protect pages
  if (isProtectedPage(pathname) && !token) {
    const lang = getLang(pathname);
    const url = req.nextUrl.clone();
    url.pathname = `/${lang}/login`;
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // logged-in users visiting /[lang]/login → bounce to dashboard
  if (token && /^\/(en|es|ca|fr|it)\/login\/?$/i.test(pathname)) {
    const lang = getLang(pathname);
    const url = req.nextUrl.clone();
    url.pathname = `/${lang}/dashboard`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
