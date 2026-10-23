import { APP_DOMAIN } from "@/lib/constants";
import { BETA_APP_ACCESS, betaAppUrl } from "@/lib/beta-handoff-rules";

/** Where an old stand page lives on the website. Pay, checkout and manage links never move. */
export type BetaStandTarget =
  | { kind: "home" }
  | { kind: "cart" }
  | { kind: "product"; productSlug: string }
  | { kind: "category"; categorySlug: string }
  | { kind: "preOrders" }
  | { kind: "preOrder"; pageSlug: string }
  | { kind: "subscriptions" }
  | { kind: "subscription"; offerSlug: string };

/** Off with `LEGACY_STAND_REDIRECTS=off`, or with the beta hand-off (`BETA_APP_URL` unset). */
export function betaStandRedirectsEnabled(): boolean {
  return process.env.LEGACY_STAND_REDIRECTS !== "off" && betaAppUrl() !== null;
}

export function isBetaOwner(betaFeatures: string[]): boolean {
  return betaFeatures.includes(BETA_APP_ACCESS);
}

const seg = (s: string) => encodeURIComponent(decodeURIComponent(s).trim().toLowerCase());

/** Path on the website; products not sold online fall back to the shop page. */
export function websitePathFor(target: BetaStandTarget, productOnSite = true): string {
  switch (target.kind) {
    case "home":
      return "/";
    case "cart":
      return "/cart";
    case "category":
      return `/${seg(target.categorySlug)}`;
    case "preOrders":
      return "/pre-orders";
    case "preOrder":
      return `/pre-orders/${seg(target.pageSlug)}`;
    case "subscriptions":
      return "/subscriptions";
    case "subscription":
      return `/subscriptions/${seg(target.offerSlug)}`;
    case "product":
      return productOnSite ? `/products/${seg(target.productSlug)}` : "/shop";
  }
}

/** Primary custom domain when active, else the shop's Vendl subdomain. */
export function websiteOrigin(storefrontSlug: string, primaryHostname: string | null): string {
  return primaryHostname ? `https://${primaryHostname}` : `https://${storefrontSlug}.${APP_DOMAIN}`;
}

/** The website's stand: the one chosen in the draft when it still exists, else the oldest. */
export function websiteStandId(standIds: string[], draftConfig: unknown): string | undefined {
  const raw =
    draftConfig && typeof draftConfig === "object" && !Array.isArray(draftConfig)
      ? (draftConfig as Record<string, unknown>).websiteStandId
      : undefined;
  const chosen = typeof raw === "string" && standIds.includes(raw) ? raw : undefined;
  return chosen ?? standIds[0];
}
