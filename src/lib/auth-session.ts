/** Idle session lifetime — refreshed on each matched middleware hit. */
export const SESSION_MAX_AGE_SEC = 90 * 24 * 60 * 60; // 90 days

/** Re-issue the JWT cookie at most this often (Auth.js default). */
export const SESSION_UPDATE_AGE_SEC = 24 * 60 * 60; // 1 day

export function sessionCookieName(secure: boolean) {
  return secure ? "__Secure-authjs.session-token" : "authjs.session-token";
}

export function requestIsSecure(request: {
  headers: Headers;
  nextUrl: { protocol: string };
}) {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0]?.trim() === "https";
  return request.nextUrl.protocol === "https:";
}
