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

/** Phase 9A — Buy a Domain feature flags (off until spike + app gate). */
export function domainSearchEnabled(): boolean {
  return (
    customDomainsFeatureEnabled() &&
    process.env.DOMAIN_SEARCH_ENABLED === "1"
  );
}

export function domainPurchaseEnabled(): boolean {
  return (
    domainSearchEnabled() &&
    process.env.DOMAIN_PURCHASE_ENABLED === "1"
  );
}

export function auDomainPurchaseEnabled(): boolean {
  return (
    domainPurchaseEnabled() &&
    process.env.AU_DOMAIN_PURCHASE_ENABLED === "1"
  );
}

export function premiumDomainPurchaseEnabled(): boolean {
  return process.env.PREMIUM_DOMAIN_PURCHASE_ENABLED === "1";
}
