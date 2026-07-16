import { cleanEnvSecret } from "@/lib/env";

export type DemoRegion = "au" | "us" | "row";

/** Country picker options. USA + Rest of world share one stand. */
export const DEMO_REGIONS: {
  id: DemoRegion;
  label: string;
  description: string;
  /** Suggested stand display name for the admin owner. */
  standName: string;
  envKey: "DEMO_STAND_SLUG_AU" | "DEMO_STAND_SLUG_US";
}[] = [
  {
    id: "au",
    label: "Australia",
    description: "Cash, PayID, and Card (test)",
    standName: "Green Valley Eggs Australia",
    envKey: "DEMO_STAND_SLUG_AU",
  },
  {
    id: "us",
    label: "United States",
    description: "Cash and Card (test)",
    standName: "Green Valley Eggs USA",
    envKey: "DEMO_STAND_SLUG_US",
  },
  {
    id: "row",
    label: "Rest of world",
    description: "Same stand as USA — cash and Card (test)",
    standName: "Green Valley Eggs USA",
    envKey: "DEMO_STAND_SLUG_US",
  },
];

export function isDemoRegion(value: string | null | undefined): value is DemoRegion {
  return value === "au" || value === "us" || value === "row";
}

export function demoStandSlugForRegion(region: DemoRegion): string | null {
  const entry = DEMO_REGIONS.find((r) => r.id === region);
  if (!entry) return null;
  const slug = cleanEnvSecret(process.env[entry.envKey]);
  return slug ? slug.toLowerCase() : null;
}

/** All configured demo stand slugs (for checkout routing). */
export function demoStandSlugs(): Set<string> {
  const keys = ["DEMO_STAND_SLUG_AU", "DEMO_STAND_SLUG_US"] as const;
  const slugs = keys
    .map((key) => cleanEnvSecret(process.env[key])?.toLowerCase())
    .filter((s): s is string => Boolean(s));
  return new Set(slugs);
}

export function isDemoStandSlug(slug: string): boolean {
  return demoStandSlugs().has(slug.trim().toLowerCase());
}

/** Test-mode Connect account for demo Card checkout (optional when platform key is already sk_test). */
export function demoStripeAccountId(): string | null {
  return cleanEnvSecret(process.env.DEMO_STRIPE_ACCOUNT_ID);
}
