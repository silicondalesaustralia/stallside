import type { EntitySeoSettings, SeoDefaults } from "@/lib/studio/seo-settings";

export type EntitySeoContext = {
  label: string;
  pathLabel: string;
  defaults: SeoDefaults;
  settings: EntitySeoSettings;
};
