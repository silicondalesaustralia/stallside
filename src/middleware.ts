import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { encode, getToken } from "@auth/core/jwt";
import {
  SESSION_MAX_AGE_SEC,
  requestIsSecure,
  sessionCookieName,
} from "@/lib/auth-session";

/** Expose path for login callbackUrl; refresh Auth.js JWT cookie (sliding session). */
export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-stallside-pathname", request.nextUrl.pathname);
  requestHeaders.set("x-stallside-search", request.nextUrl.search);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  await refreshSessionCookie(request, response);
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
  // Include marketing home so returning owners keep a fresh session cookie.
  matcher: [
    "/",
    "/login",
    "/signup",
    "/about",
    "/contact",
    "/dashboard/:path*",
    "/onboarding",
    "/admin/:path*",
  ],
};
