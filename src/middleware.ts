import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Expose path for login callbackUrl when requireUser redirects. */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-stallside-pathname", request.nextUrl.pathname);
  requestHeaders.set("x-stallside-search", request.nextUrl.search);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
