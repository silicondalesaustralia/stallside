import type { BusinessMode } from "@/lib/business-mode";
import type { TemplatePackage } from "../package-schema";
import { PRODUCT_FIRST } from "./product-first";
import { STORY_FIRST } from "./story-first";
import { WEEKLY_RELEASE } from "./weekly-release";

export const TEMPLATE_PACKAGES: readonly TemplatePackage[] = [PRODUCT_FIRST, WEEKLY_RELEASE, STORY_FIRST];

export function templatePackagesFor(mode: BusinessMode): TemplatePackage[] {
  return TEMPLATE_PACKAGES.filter((p) => p.businessModes.includes(mode));
}

export function findTemplatePackage(id: string): TemplatePackage | undefined {
  return TEMPLATE_PACKAGES.find((p) => p.id === id);
}
