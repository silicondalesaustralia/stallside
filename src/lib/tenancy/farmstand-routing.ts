import { fetchInternalTenancy } from "@/lib/domains/middleware-lookup";
import { FARMSTAND_PATH } from "@/lib/farmstand/paths";

export type FarmstandLookup = {
  isPublished: boolean;
  mainStandSlug: string;
  standSlugs: string[];
};

const cache = new Map<string, { at: number; value: FarmstandLookup | null }>();
const TTL_MS = 60_000;

/** Paths on a seller host that may be farmstand pages. */
function mayBeFarmstand(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === FARMSTAND_PATH ||
    pathname.startsWith(`${FARMSTAND_PATH}/`) ||
    pathname.startsWith("/s/")
  );
}

async function lookupFarmstand(slug: string, requestUrl: URL): Promise<FarmstandLookup | null> {
  const hit = cache.get(slug);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;
  let value: FarmstandLookup | null = null;
  try {
    const res = await fetchInternalTenancy(
      `/api/tenancy/farmstand-lookup?slug=${encodeURIComponent(slug)}`,
      requestUrl,
    );
    if (res.ok) {
      const data = (await res.json()) as Partial<FarmstandLookup>;
      if (data.mainStandSlug && Array.isArray(data.standSlugs)) {
        value = {
          isPublished: Boolean(data.isPublished),
          mainStandSlug: data.mainStandSlug,
          standSlugs: data.standSlugs,
        };
      }
    } else if (res.status >= 500) {
      return null;
    }
  } catch (err) {
    console.error("[farmstand-routing] lookup failed", slug, err);
    return null;
  }
  cache.set(slug, { at: Date.now(), value });
  return value;
}

/**
 * Internal `/s/{stand}/…` path for a farmstand request on a seller host, or null:
 * - `/farmstand[/{stand}]/…` is the farmstand (the owner's main stand unless a stand is named);
 * - `/` is the farmstand while the owner has no published website;
 * - `/s/{stand}/…` links inside the farmstand stay on the host for the owner's own stands.
 */
export function farmstandPathFor(pathname: string, info: FarmstandLookup): string | null {
  if (pathname === "/") return info.isPublished ? null : `/s/${info.mainStandSlug}`;
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "s") return segments[1] && info.standSlugs.includes(segments[1]) ? pathname : null;
  if (`/${segments[0]}` !== FARMSTAND_PATH) return null;
  const named = segments[1] && info.standSlugs.includes(segments[1]) ? segments[1] : null;
  const rest = segments.slice(named ? 2 : 1);
  return `/s/${named ?? info.mainStandSlug}${rest.length ? `/${rest.join("/")}` : ""}`;
}

export async function farmstandTenantPath(
  slug: string,
  pathname: string,
  requestUrl: URL,
): Promise<string | null> {
  if (!mayBeFarmstand(pathname)) return null;
  const info = await lookupFarmstand(slug, requestUrl);
  return info ? farmstandPathFor(pathname, info) : null;
}
