import { appBaseUrl } from "@/lib/app-url";
import { cleanEnvSecret } from "@/lib/env";
import { preOrderPagePath } from "@/lib/preorder-page";

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
  const entry = DEMO_PRODUCTS.find((p) => p.id === product);
  if (!entry) return null;
  const slug = cleanEnvSecret(process.env[entry.envKey]);
  return slug ? slug.toLowerCase() : null;
}

/** Public pre-order page slug for the pre-orders demo (under DEMO_PREORDER_STAND_SLUG). */
export function demoPreOrderPageSlug(): string | null {
  const slug = cleanEnvSecret(process.env.DEMO_PREORDER_PAGE_SLUG);
  return slug ? slug.toLowerCase() : null;
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

/** All configured demo stand slugs (for checkout routing / admin stats). */
export function demoStandSlugs(): Set<string> {
  const keys = ["DEMO_STALL_STAND_SLUG", "DEMO_PREORDER_STAND_SLUG"] as const;
  const slugs = keys
    .map((key) => cleanEnvSecret(process.env[key])?.toLowerCase())
    .filter((s): s is string => Boolean(s));
  return new Set(slugs);
}

export function isDemoStandSlug(slug: string): boolean {
  return demoStandSlugs().has(slug.trim().toLowerCase());
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
