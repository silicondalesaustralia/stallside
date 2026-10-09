import { cleanEnvSecret } from "@/lib/env";
import type { StudioTemplateId } from "@/lib/studio/types";

export const GREEN_VALLEY_DEMO_EMAIL = "green-valley-demo@vendl.app";
export const GREEN_VALLEY_DEMO_STAND_SLUG = "green-valley-farm-bakes";
export const GREEN_VALLEY_DEMO_STOREFRONT_SLUG = "green-valley-farm-bakes";
export const GREEN_VALLEY_DEMO_COOKIE = "vendl_demo_template";

export const GREEN_VALLEY_DEMO_TEMPLATES: StudioTemplateId[] = [
  "artisan",
  "farmhouse",
  "market",
];

export function isGreenValleyDemoTemplate(
  value: string | null | undefined,
): value is StudioTemplateId {
  return value === "artisan" || value === "farmhouse" || value === "market";
}

export function websiteDemoStandSlug(): string {
  return (
    cleanEnvSecret(process.env.DEMO_WEBSITE_STAND_SLUG)?.toLowerCase() ??
    GREEN_VALLEY_DEMO_STAND_SLUG
  );
}

export function websiteDemoStorefrontSlug(): string {
  return (
    cleanEnvSecret(process.env.DEMO_WEBSITE_STOREFRONT_SLUG)?.toLowerCase() ??
    GREEN_VALLEY_DEMO_STOREFRONT_SLUG
  );
}

export function isWebsiteDemoStorefrontSlug(slug: string): boolean {
  return slug.trim().toLowerCase() === websiteDemoStorefrontSlug();
}

export function isWebsiteDemoStandSlug(slug: string): boolean {
  return slug.trim().toLowerCase() === websiteDemoStandSlug();
}

export function demoTemplatePath(template: StudioTemplateId): string {
  return `/demo/${template}`;
}
