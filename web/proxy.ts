import { NextResponse, type NextRequest } from "next/server";

const legacyWordpressPrefixes = [
  "/wp-admin",
  "/wp-content",
  "/wp-includes",
  "/wp-json",
];

const legacyWordpressExact = [
  "/wp-login.php",
  "/xmlrpc.php",
];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isLegacyWordpressPath =
    legacyWordpressPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) ||
    legacyWordpressExact.includes(pathname);

  if (!isLegacyWordpressPath) {
    return NextResponse.next();
  }

  const redirectUrl = new URL("/migrasi-situs", request.url);
  if (pathname || search) {
    redirectUrl.searchParams.set("from", `${pathname}${search}`);
  }

  return NextResponse.redirect(redirectUrl, 308);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest).*)"],
};
