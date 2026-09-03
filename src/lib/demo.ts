import { appBaseUrl } from "@/lib/app-url";
import { cleanEnvSecret } from "@/lib/env";
import { preOrderPagePath } from "@/lib/preorder-page";
import {
  isWebsiteDemoStandSlug,
  websiteDemoStandSlug,
} from "@/lib/demo/green-valley/constants";

/** Test-card pre-order demo: https://vendl.app/s/green-valley-baked-goods/pre/pre-order-bread-27-may-2027 */
export const DEFAULT_DEMO_PREORDER_STAND_SLUG = "green-valley-baked-goods";
export const DEFAULT_DEMO_PREORDER_PAGE_SLUG = "pre-order-bread-27-may-2027";

export {
  websiteDemoStandSlug,
  websiteDemoStorefrontSlug,
  isWebsiteDemoStandSlug,
  isWebsiteDemoStorefrontSlug,
  isGreenValleyDemoTemplate,
  demoTemplatePath,
  GREEN_VALLEY_DEMO_COOKIE,
  GREEN_VALLEY_DEMO_TEMPLATES,
} from "@/lib/demo/green-valley/constants";

export type DemoProduct = "stall" | "preorder";

export const DEMO_PRODUCTS: {
  id: DemoProduct;
  label: string;
  description: string;
  envKey: "DEMO_STALL_STAND_SLUG" | "DEMO_PREORDER_STAND_SLUG";
}[] = [
  {
    id: "stall",
    label: "Stall",
    description: "Unattended QR checkout - scan, pay, owner gets an alert",
    envKey: "DEMO_STALL_STAND_SLUG",
  },
  {
    id: "preorder",
    label: "Pre-orders",
    description: "Share a link or QR - customers order and pay ahead",
    envKey: "DEMO_PREORDER_STAND_SLUG",
  },
];

export function isDemoProduct(
  value: string | null | undefined,
): value is DemoProduct {
  return value === "stall" || value === "preorder";
}

export function demoStandSlugForProduct(product: DemoProduct): string | null {
  if (product === "preorder") return DEFAULT_DEMO_PREORDER_STAND_SLUG;
  const slug = cleanEnvSecret(process.env.DEMO_STALL_STAND_SLUG);
  return slug ? slug.toLowerCase() : null;
}

/** Public pre-order page slug for the pre-orders demo. */
export function demoPreOrderPageSlug(): string {
  return DEFAULT_DEMO_PREORDER_PAGE_SLUG;
}

/** Absolute customer URL for the selected demo product. */
export function demoCustomerUrlForProduct(
  product: DemoProduct,
): string | null {
  const standSlug = demoStandSlugForProduct(product);
  if (!standSlug) return null;
  if (product === "preorder") {
    const pageSlug = demoPreOrderPageSlug();
    if (!pageSlug) return null;
    return `${appBaseUrl()}${preOrderPagePath(standSlug, pageSlug)}`;
  }
  return `${appBaseUrl()}/s/${standSlug}`;
}

/** Instrumented demo stands (test card + success redirect + website demo). */
export function demoStandSlugs(): Set<string> {
  const slugs = [
    cleanEnvSecret(process.env.DEMO_STALL_STAND_SLUG)?.toLowerCase(),
    demoStandSlugForProduct("preorder"),
    websiteDemoStandSlug(),
  ].filter((s): s is string => Boolean(s));
  return new Set(slugs);
}

export function isDemoStandSlug(slug: string): boolean {
  const normalized = slug.trim().toLowerCase();
  return demoStandSlugs().has(normalized) || isWebsiteDemoStandSlug(normalized);
}

/** Map a demo stand slug back to a /demo product query param. */
export function demoProductForStandSlug(slug: string): DemoProduct | null {
  const normalized = slug.trim().toLowerCase();
  const stall = demoStandSlugForProduct("stall");
  const preorder = demoStandSlugForProduct("preorder");
  if (stall && normalized === stall) return "stall";
  if (preorder && normalized === preorder) return "preorder";
  return null;
}

/** Test-mode Connect account for demo Card checkout (optional when platform key is already sk_test). */
export function demoStripeAccountId(): string | null {
  return cleanEnvSecret(process.env.DEMO_STRIPE_ACCOUNT_ID);
}
