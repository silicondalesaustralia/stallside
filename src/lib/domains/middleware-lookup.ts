import { APP_DOMAIN } from "@/lib/constants";
import {
  customDomainsRoutingEnabled,
  domainsInternalLookupSecret,
} from "@/lib/domains/config";
import { normalizeDomainHostname } from "@/lib/domains/normalize";

type LookupResult = { slug: string; hostname: string; isPrimary: boolean };

const cache = new Map<string, { at: number; value: LookupResult | null }>();
const TTL_MS = 60_000;

/** Calls an internal `/api/tenancy/*` route from middleware. */
export function fetchInternalTenancy(pathAndQuery: string, requestUrl: URL): Promise<Response> {
  // Prefer this deployment's Vercel URL so lookup doesn't recurse through the
  // custom hostname (and Cloudflare) before the API route can answer.
  const vercelHost = process.env.VERCEL_URL?.replace(/^https?:\/\//, "").trim();
  const base =
    (vercelHost ? `https://${vercelHost}` : null) ||
    requestUrl.origin ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    `https://${APP_DOMAIN}`;
  const headers = new Headers();
  const secret = domainsInternalLookupSecret();
  if (secret) headers.set("x-vendl-internal", secret);
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim();
  if (bypass) headers.set("x-vercel-protection-bypass", bypass);
  return fetch(`${base}${pathAndQuery}`, { headers, signal: AbortSignal.timeout(2500) });
}

async function lookupCustomHost(
  hostname: string,
  requestUrl: URL,
): Promise<LookupResult | null> {
  const host = normalizeDomainHostname(hostname);
  if (!host || !customDomainsRoutingEnabled()) return null;

  const hit = cache.get(host);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;

  try {
    const res = await fetchInternalTenancy(
      `/api/tenancy/host-lookup?hostname=${encodeURIComponent(host)}`,
      requestUrl,
    );
    if (!res.ok) {
      cache.set(host, { at: Date.now(), value: null });
      return null;
    }
    const data = (await res.json()) as LookupResult;
    if (!data?.slug) {
      cache.set(host, { at: Date.now(), value: null });
      return null;
    }
    const value = {
      slug: data.slug,
      hostname: data.hostname,
      isPrimary: Boolean(data.isPrimary),
    };
    cache.set(host, { at: Date.now(), value });
    return value;
  } catch {
    return null;
  }
}

export async function resolveCustomDomainSlug(
  hostname: string,
  requestUrl: URL,
): Promise<string | null> {
  const result = await lookupCustomHost(hostname, requestUrl);
  return result?.slug ?? null;
}
