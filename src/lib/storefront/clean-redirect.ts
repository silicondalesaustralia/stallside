import { permanentRedirect } from "next/navigation";
import { currentStorefrontBasePath } from "@/lib/tenancy/request-base-path";

/**
 * 308 to a clean storefront path on the current host: `/eggs` on a seller domain or
 * subdomain, `/shop/{slug}/eggs` on vendl.app (drafts/previews).
 */
export async function redirectWithinStorefront(
  storefrontSlug: string,
  relativePath: string,
  draft = false,
): Promise<never> {
  const base = await currentStorefrontBasePath(storefrontSlug);
  const rel = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
  const path = `${base}${rel === "/" && base ? "" : rel}`.replace(/\/{2,}/g, "/") || "/";
  permanentRedirect(draft ? `${path}?draft=1` : path);
}
