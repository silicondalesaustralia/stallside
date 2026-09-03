/** Feature flags and Cloudflare SaaS config (server-side). */

export function customDomainsFeatureEnabled(): boolean {
  return process.env.CUSTOM_DOMAINS_ENABLED === "1";
}

export function customDomainsRoutingEnabled(): boolean {
  return (
    customDomainsFeatureEnabled() &&
    process.env.CUSTOM_DOMAINS_ROUTING_ENABLED === "1"
  );
}

export function cloudflareSaasCnameTarget(): string {
  return (
    process.env.CLOUDFLARE_SAAS_CNAME_TARGET?.trim().toLowerCase() ||
    "customers.vendl.app"
  );
}

export function cloudflareConfigured(): boolean {
  return Boolean(
    process.env.CLOUDFLARE_API_TOKEN?.trim() &&
      process.env.CLOUDFLARE_ZONE_ID?.trim() &&
      process.env.CLOUDFLARE_ACCOUNT_ID?.trim(),
  );
}

export function domainsInternalLookupSecret(): string | null {
  return process.env.DOMAINS_INTERNAL_LOOKUP_SECRET?.trim() || null;
}
