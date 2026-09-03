import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { encode, getToken } from "@auth/core/jwt";
import {
  SESSION_MAX_AGE_SEC,
  requestIsSecure,
  sessionCookieName,
} from "@/lib/auth-session";
import { APP_DOMAIN } from "@/lib/constants";
import { resolveHostname } from "@/lib/tenancy/hostname";
import { requestPublicHostname } from "@/lib/tenancy/request-hostname";
import { legacyStorefrontRedirect } from "@/lib/tenancy/legacy-redirects";
import { resolveCustomDomainSlug } from "@/lib/domains/middleware-lookup";

const STALLSIDE_HOSTS = new Set(["stallside.app", "www.stallside.app"]);

function apexOrigin(request: NextRequest): string {
  const proto = requestIsSecure(request) ? "https" : "http";
  return `${proto}://${APP_DOMAIN}`;
}

function keepOnStallside(pathname: string): boolean {
  return (
    pathname === "/s" ||
    pathname.startsWith("/s/") ||
    pathname.startsWith("/checkout/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/unsubscribe/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.webmanifest" ||
    pathname.includes(".")
  );
}

function tenantRewritePath(slug: string, pathname: string): string | null {
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.webmanifest" ||
    pathname.includes(".")
  ) {
    return null;
  }

  const shopPrefix = `/shop/${slug}`;
  if (pathname === shopPrefix || pathname.startsWith(`${shopPrefix}/`)) {
    return pathname;
  }

  if (
    pathname.startsWith("/s/") ||
    pathname.startsWith("/checkout/") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup")
  ) {
    return null;
  }

  if (pathname === "/") return shopPrefix;
  return `${shopPrefix}${pathname}`;
}

function shouldRedirectTenantToApex(pathname: string): boolean {
  return (
    pathname.startsWith("/s/") ||
    pathname.startsWith("/checkout/") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup")
  );
}

function applyTenantRewrite(
  request: NextRequest,
  slug: string,
  pathname: string,
) {
  if (shouldRedirectTenantToApex(pathname)) {
    const dest = new URL(
      `${apexOrigin(request)}${pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(dest, 307);
  }

  const rewritten = tenantRewritePath(slug, pathname);
  if (rewritten && rewritten !== pathname) {
    const url = request.nextUrl.clone();
    url.pathname = rewritten;
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-vendl-tenant-slug", slug);
    requestHeaders.set("x-stallside-pathname", rewritten);
    requestHeaders.set("x-stallside-search", request.nextUrl.search);
    return NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-vendl-tenant-slug", slug);
  requestHeaders.set("x-stallside-pathname", pathname);
  requestHeaders.set("x-stallside-search", request.nextUrl.search);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export async function middleware(request: NextRequest) {
  const hostHeader = requestPublicHostname(request);
  const host = hostHeader;
  const pathname = request.nextUrl.pathname;

  const legacyDest = legacyStorefrontRedirect(
    pathname,
    request.nextUrl.search,
  );
  if (legacyDest) {
    const dest = request.nextUrl.clone();
    const [pathPart, queryPart] = legacyDest.split("?");
    dest.pathname = pathPart || "/";
    dest.search = queryPart ? `?${queryPart}` : "";
    return NextResponse.redirect(dest, 308);
  }

  // Must reach the Node host-lookup route before custom-domain handling.
  // Otherwise middleware fetches itself, gets /not-found, and stallside → vendl.
  if (pathname.startsWith("/api/tenancy/host-lookup")) {
    return NextResponse.next();
  }

  const resolution = resolveHostname(hostHeader);

  if (resolution.type === "CUSTOM_DOMAIN") {
    const slug = await resolveCustomDomainSlug(
      resolution.hostname,
      request.nextUrl,
    );
    if (slug) {
      return applyTenantRewrite(request, slug, pathname);
    }
    // Legacy brand hosts: keep redirecting to Vendl unless connected as a custom domain.
    if (STALLSIDE_HOSTS.has(host) && !keepOnStallside(pathname)) {
      const dest = new URL(
        `https://www.vendl.app${pathname}${request.nextUrl.search}`,
      );
      return NextResponse.redirect(dest, 307);
    }
    return NextResponse.rewrite(new URL("/not-found", request.url));
  }

  if (STALLSIDE_HOSTS.has(host) && !keepOnStallside(pathname)) {
    const dest = new URL(
      `https://www.vendl.app${pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(dest, 307);
  }

  if (
    (resolution.type === "VENDL_SUBDOMAIN" ||
      resolution.type === "STAGING_SUBDOMAIN" ||
      resolution.type === "LOCAL_SUBDOMAIN") &&
    "slug" in resolution
  ) {
    return applyTenantRewrite(request, resolution.slug, pathname);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-stallside-pathname", pathname);
  requestHeaders.set("x-stallside-search", request.nextUrl.search);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/auth")
  ) {
    await refreshSessionCookie(request, response);
  }
  return response;
}

async function refreshSessionCookie(
  request: NextRequest,
  response: NextResponse,
) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return;

  const secure = requestIsSecure(request);
  const preferredName = sessionCookieName(secure);
  const fallbackName = sessionCookieName(!secure);

  try {
    let cookieName = preferredName;
    let token = await getToken({
      req: request,
      secret,
      secureCookie: secure,
      salt: preferredName,
      cookieName: preferredName,
    });

    if (!token) {
      token = await getToken({
        req: request,
        secret,
        secureCookie: !secure,
        salt: fallbackName,
        cookieName: fallbackName,
      });
      if (!token) return;
      cookieName = fallbackName;
    }

    const { exp: _exp, iat: _iat, jti: _jti, ...payload } = token;
    const value = await encode({
      token: payload,
      secret,
      maxAge: SESSION_MAX_AGE_SEC,
      salt: cookieName,
    });

    response.cookies.set(cookieName, value, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: cookieName.startsWith("__Secure-"),
      maxAge: SESSION_MAX_AGE_SEC,
    });
  } catch {
    // Leave existing cookie alone if refresh fails
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
