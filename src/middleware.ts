import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { encode, getToken } from "@auth/core/jwt";
import {
  SESSION_MAX_AGE_SEC,
  requestIsSecure,
  sessionCookieName,
} from "@/lib/auth-session";

const STALLSIDE_HOSTS = new Set(["stallside.app", "www.stallside.app"]);

/** Paths that must keep working on stallside (printed QR posters + checkout returns). */
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

/** Expose path for login callbackUrl; refresh Auth.js JWT cookie (sliding session). */
export async function middleware(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  if (STALLSIDE_HOSTS.has(host) && !keepOnStallside(request.nextUrl.pathname)) {
    const dest = new URL(
      `https://www.vendl.app${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(dest, 307);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-stallside-pathname", request.nextUrl.pathname);
  requestHeaders.set("x-stallside-search", request.nextUrl.search);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/auth")
  ) {
    await refreshSessionCookie(request, response);
  }
  return response;
}

async function refreshSessionCookie(request: NextRequest, response: NextResponse) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return;

  const secure = requestIsSecure(request);
  // Prefer the cookie name Auth.js used at sign-in (AUTH_URL https → __Secure-).
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
  matcher: [
    // Host redirect + session refresh. Skip hashed Next static assets.
    "/((?!_next/static|_next/image).*)",
  ],
};
