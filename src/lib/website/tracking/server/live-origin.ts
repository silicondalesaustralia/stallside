import { customDomainsRoutingEnabled } from "@/lib/domains/config";
import { loadPrimaryCustomHostname } from "@/lib/domains/resolve";
import { storefrontSubdomainOrigin } from "@/lib/tenancy/public-url";

/** Where seller tags run: the primary custom domain, else {slug}.vendl.app. Never vendl.app/shop/…. */
export async function liveSiteOrigin(storefront: { id: string; slug: string }): Promise<string> {
  const primary = customDomainsRoutingEnabled() ? await loadPrimaryCustomHostname(storefront.id) : null;
  return primary ? `https://${primary}` : storefrontSubdomainOrigin(storefront.slug);
}
