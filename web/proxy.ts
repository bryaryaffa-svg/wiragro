import { NextResponse, type NextRequest } from "next/server";

const CANONICAL_HOSTNAME = "wiragro.id";
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

const legacyEditorialPrefixes = [
  "/blog",
  "/category",
  "/tag",
  "/author",
  "/feed",
];

const legacyCommercePrefixes = ["/shop", "/product", "/product-category"];

function buildRedirectUrl(
  request: NextRequest,
  pathname?: string,
  forceCanonicalHost = false,
) {
  const redirectUrl = request.nextUrl.clone();

  if (forceCanonicalHost) {
    redirectUrl.protocol = "https:";
    redirectUrl.hostname = CANONICAL_HOSTNAME;
    redirectUrl.port = "";
  }

  if (pathname) {
    redirectUrl.pathname = pathname;
  }

  return redirectUrl;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "")
    .split(",")[0]
    .trim();
  const forwardedProto = (request.headers.get("x-forwarded-proto") ?? "https")
    .split(",")[0]
    .trim();
  const shouldForceCanonicalHost =
    host === CANONICAL_HOSTNAME || host === `www.${CANONICAL_HOSTNAME}`;

  if (host === `www.${CANONICAL_HOSTNAME}` || (host === CANONICAL_HOSTNAME && forwardedProto === "http")) {
    return NextResponse.redirect(buildRedirectUrl(request, undefined, true), 308);
  }

  if (pathname !== "/" && pathname.endsWith("/") && !/\.[a-z0-9]+$/i.test(pathname)) {
    return NextResponse.redirect(
      buildRedirectUrl(request, pathname.replace(/\/+$/, ""), shouldForceCanonicalHost),
      308,
    );
  }

  if (
    pathname === "/sitemap_index.xml" ||
    pathname.startsWith("/wp-sitemap") ||
    pathname.endsWith("-sitemap.xml")
  ) {
    return NextResponse.redirect(
      buildRedirectUrl(request, "/sitemap.xml", shouldForceCanonicalHost),
      308,
    );
  }

  if (legacyEditorialPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return NextResponse.redirect(
      buildRedirectUrl(request, "/artikel", shouldForceCanonicalHost),
      308,
    );
  }

  if (legacyCommercePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return NextResponse.redirect(
      buildRedirectUrl(request, "/produk", shouldForceCanonicalHost),
      308,
    );
  }

  const isLegacyWordpressPath =
    legacyWordpressPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) ||
    legacyWordpressExact.includes(pathname);

  if (!isLegacyWordpressPath) {
    return NextResponse.next();
  }

  const redirectUrl = buildRedirectUrl(request, "/migrasi-situs", shouldForceCanonicalHost);
  if (pathname || search) {
    redirectUrl.searchParams.set("from", `${pathname}${search}`);
  }

  return NextResponse.redirect(redirectUrl, 308);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest).*)"],
};
