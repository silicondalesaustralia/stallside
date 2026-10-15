import type { EntitySeoSettings, SeoDefaults } from "@/lib/studio/seo-settings";

/** An editable address: `{prefix}{slug}`, e.g. `/products/` + `free-range-eggs`. */
export type EntityUrl = { prefix: string; slug: string };

/** `seo` query value for an address error; the card shows the text after the prefix. */
export const URL_ERROR_PREFIX = "url-error:";

export type SlugChangeResult = { ok: true } | { ok: false; message: string };

export type EntitySeoContext = {
  label: string;
  pathLabel: string;
  defaults: SeoDefaults;
  settings: EntitySeoSettings;
  /** Present when the owner can change this item's address from its SEO settings. */
  url?: EntityUrl;
};
