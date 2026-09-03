import { APP_DOMAIN } from "@/lib/constants";
import {
  customDomainsRoutingEnabled,
  domainsInternalLookupSecret,
} from "@/lib/domains/config";
import { normalizeDomainHostname } from "@/lib/domains/normalize";

type LookupResult = { slug: string; hostname: string; isPrimary: boolean };

const cache = new Map<string, { at: number; value: LookupResult | null }>();
const TTL_MS = 60_000;

async function lookupCustomHost(
  hostname: string,
  requestUrl: URL,
): Promise<LookupResult | null> {
  const host = normalizeDomainHostname(hostname);
  if (!host || !customDomainsRoutingEnabled()) return null;

  const hit = cache.get(host);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;

  const secret = domainsInternalLookupSecret();
  // Look up on this deployment so the domain row is read from the same env DB.
  const base =
    requestUrl.origin ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    `https://${APP_DOMAIN}`;

  try {
    const url = `${base}/api/tenancy/host-lookup?hostname=${encodeURIComponent(host)}`;
    const res = await fetch(url, {
      headers: secret ? { "x-vendl-internal": secret } : undefined,
      signal: AbortSignal.timeout(2500),
    });
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
