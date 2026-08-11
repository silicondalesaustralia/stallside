import type { ProductLpContent } from "./types";

function adsHeadlineForCanonical(canonical: string): string {
  if (canonical.endsWith("/bakers")) {
    return "You Will Make More Money With Vendl Pre-Orders For Bakers";
  }
  if (canonical.endsWith("/farm-stalls")) {
    return "You Will Make More Money At Your Farm With Vendl Pre-Orders";
  }
  if (canonical.endsWith("/firewood")) {
    return "You Will Make More Money Selling Firewood With Vendl Pre-Orders";
  }
  return "You Will Make More Money With Vendl Pre-Orders";
}

/** Remap indexed product pages to bare /lp/ ads URLs (noindex). */
export function asPreOrdersAdsLp(content: ProductLpContent): ProductLpContent {
  const canonical = content.canonical.startsWith("/pre-orders")
    ? `/lp${content.canonical}`
    : `/lp/pre-orders`;

  const signupHref = content.signupHref.includes("utm_content=")
    ? content.signupHref.replace(
        /utm_content=[^&]+/,
        (m) => `${m}-ads-lp`,
      )
    : `${content.signupHref}${content.signupHref.includes("?") ? "&" : "?"}utm_content=pre-orders-ads-lp`;

  return {
    ...content,
    canonical,
    signupHref,
    headline: adsHeadlineForCanonical(canonical),
    doorwayLinks: content.doorwayLinks?.map((d) => ({
      ...d,
      href: d.href.startsWith("/pre-orders") ? `/lp${d.href}` : d.href,
    })),
  };
}
