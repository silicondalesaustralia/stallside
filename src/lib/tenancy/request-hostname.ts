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
  return false;
}

/**
 * Hostname used for tenancy: prefer Cloudflare-preserved original seller host
 * when the request Host was rewritten to the fallback origin.
 */
export function requestPublicHostname(
  request: Pick<NextRequest, "headers">,
): string {
  const host = normalizeHostname(request.headers.get("host"));
  const original = normalizeHostname(
    request.headers.get("x-vendl-original-host") ||
      request.headers.get("x-forwarded-host"),
  );
  if (original && isVendlInfraHostname(host) && !isVendlInfraHostname(original)) {
    return original;
  }
  return host;
}
