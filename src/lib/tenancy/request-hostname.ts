import type { NextRequest } from "next/server";
import { APP_DOMAIN } from "@/lib/constants";
import { normalizeHostname } from "@/lib/tenancy/hostname";

/**
 * Infra hosts that may appear as the HTTP Host after Cloudflare rewrites
 * the origin Host header to the SaaS fallback (so Vercel accepts the request).
 */
export function isVendlInfraHostname(hostname: string): boolean {
  const host = normalizeHostname(hostname);
  if (!host) return false;
  if (host.endsWith(".vercel.app")) return true;
  const apex = APP_DOMAIN.toLowerCase();
  if (host === apex || host === `www.${apex}`) return true;
  if (host === `staging.${apex}` || host === `www.staging.${apex}`) return true;
  if (host === `fallback.${apex}`) return true;
  if (host === `customers.${apex}`) return true;
  if (host === `saas-origin.${apex}`) return true;
  return false;
}

/** Resolve seller-facing hostname from Host + CF-preserved original. */
export function publicHostnameFromHeaders(getHeader: {
  get(name: string): string | null;
}): string {
  const host = normalizeHostname(getHeader.get("host"));
  const original = normalizeHostname(
    getHeader.get("x-vendl-original-host") ||
      getHeader.get("x-forwarded-host"),
  );
  if (original && isVendlInfraHostname(host) && !isVendlInfraHostname(original)) {
    return original;
  }
  return host;
}

/**
 * Hostname used for tenancy: prefer Cloudflare-preserved original seller host
 * when the request Host was rewritten to the fallback origin.
 */
export function requestPublicHostname(
  request: Pick<NextRequest, "headers">,
): string {
  return publicHostnameFromHeaders(request.headers);
}
