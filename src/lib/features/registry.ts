import { FEATURE_MENU_COLUMNS } from "@/lib/features/menu";
import { GROW_FEATURES } from "@/lib/features/pages-grow";
import { MAKE_SITE_FEATURES } from "@/lib/features/pages-make-site";
import { OPS_FEATURES } from "@/lib/features/pages-ops";
import { SELL_FEATURES } from "@/lib/features/pages-sell";
import type { FeaturePage } from "@/lib/features/types";

const ALL: FeaturePage[] = [
  ...SELL_FEATURES,
  ...OPS_FEATURES,
  ...GROW_FEATURES,
  ...MAKE_SITE_FEATURES,
];

const BY_SLUG = new Map(ALL.map((feature) => [feature.slug, feature]));

export function getAllFeatures(): FeaturePage[] {
  return ALL;
}

export function getFeature(slug: string): FeaturePage | undefined {
  return BY_SLUG.get(slug);
}

export function getRelatedFeatures(feature: FeaturePage): FeaturePage[] {
  return feature.relatedSlugs
    .map((slug) => BY_SLUG.get(slug))
    .filter((item): item is FeaturePage => Boolean(item));
}

export function featureStaticParams(): Array<{ slug: string }> {
  return ALL.map((feature) => ({ slug: feature.slug }));
}

export function featuresGroupedForHub(): Array<{
  heading: string;
  features: FeaturePage[];
}> {
  return FEATURE_MENU_COLUMNS.map((column) => ({
    heading: column.heading,
    features: column.items
      .map((item) => BY_SLUG.get(item.slug))
      .filter((item): item is FeaturePage => Boolean(item)),
  }));
}

export { FEATURE_MENU_COLUMNS };
