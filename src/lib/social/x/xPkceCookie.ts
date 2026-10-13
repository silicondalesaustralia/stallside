import type { NextResponse } from 'next/server'

export const X_PKCE_COOKIE = 'vendl_x_pkce'
const COOKIE_PATH = '/api/social/connect/x'

/** The PKCE verifier never goes through X; it waits here for the callback (15 minutes, httpOnly). */
export function setXPkceCookie(res: NextResponse, verifier: string) {
  res.cookies.set(X_PKCE_COOKIE, verifier, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: COOKIE_PATH,
    maxAge: 15 * 60,
  })
}

export function clearXPkceCookie(res: NextResponse) {
  res.cookies.set(X_PKCE_COOKIE, '', { httpOnly: true, secure: true, sameSite: 'lax', path: COOKIE_PATH, maxAge: 0 })
}
