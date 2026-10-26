import { normalizeHostname } from "@/lib/tenancy/hostname";
import { isVendlInfraHostname } from "@/lib/tenancy/request-hostname";

/**
 * Custom domains reach the app through the Cloudflare Worker, so Vercel sees
 * x-forwarded-host = fallback.vendl.app while the browser's Origin is the
 * seller's domain. Next.js rejects Server Actions on that mismatch (CSRF check).
 * Point x-forwarded-host at the Worker-preserved seller host instead; Origin is
 * still compared against it, so cross-site posts keep failing.
 */
export function forwardPublicHost(requestHeaders: Headers): void {
  const original = normalizeHostname(requestHeaders.get("x-vendl-original-host"));
  if (!original || isVendlInfraHostname(original)) return;
  requestHeaders.set("x-forwarded-host", original);
}
