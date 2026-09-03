export type SeoRobotsMode = "default" | "index" | "noindex";

export type EntitySeoSettings = {
  seoTitle?: string;
  seoDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  robots?: SeoRobotsMode;
};

export type StorefrontSeoConfig = {
  home?: EntitySeoSettings;
  /** Keys: page:{id}, blog:{id}, product:{id}, category:{id}, menu:{id} */
  entities?: Record<string, EntitySeoSettings>;
};

export type SeoEntityType = "home" | "page" | "blog" | "product" | "category" | "menu";

export function entitySeoKey(type: SeoEntityType, id?: string): string {
  if (type === "home") return "home";
  if (!id) throw new Error("Entity id required");
  return `${type}:${id}`;
}

export function entityKeyToParam(key: string): string {
  return key.replace(/:/g, "--");
}

export function entityKeyFromParam(param: string): string {
  if (param === "home") return "home";
  const idx = param.indexOf("--");
  if (idx < 0) return param;
  return `${param.slice(0, idx)}:${param.slice(idx + 2)}`;
}

function isEntitySeoSettings(raw: unknown): raw is EntitySeoSettings {
  if (!raw || typeof raw !== "object") return false;
  const o = raw as EntitySeoSettings;
  return (
    (o.seoTitle === undefined || typeof o.seoTitle === "string") &&
    (o.seoDescription === undefined || typeof o.seoDescription === "string") &&
    (o.ogTitle === undefined || typeof o.ogTitle === "string") &&
    (o.ogDescription === undefined || typeof o.ogDescription === "string") &&
    (o.ogImageUrl === undefined || typeof o.ogImageUrl === "string") &&
    (o.robots === undefined ||
      o.robots === "default" ||
      o.robots === "index" ||
      o.robots === "noindex")
  );
}

export function extractStorefrontSeo(raw: unknown): StorefrontSeoConfig {
  if (!raw || typeof raw !== "object") return {};
  const seo = (raw as { storefrontSeo?: unknown }).storefrontSeo;
  if (!seo || typeof seo !== "object") return {};
  const obj = seo as StorefrontSeoConfig;
  const entities: Record<string, EntitySeoSettings> = {};
  if (obj.entities && typeof obj.entities === "object") {
    for (const [key, value] of Object.entries(obj.entities)) {
      if (isEntitySeoSettings(value)) entities[key] = value;
    }
  }
  return {
    home: isEntitySeoSettings(obj.home) ? obj.home : undefined,
    entities: Object.keys(entities).length > 0 ? entities : undefined,
  };
}

export function mergeStorefrontSeoIntoRaw(
  existingRaw: unknown,
  config: StorefrontSeoConfig,
): Record<string, unknown> {
  const base =
    existingRaw && typeof existingRaw === "object" && !Array.isArray(existingRaw)
      ? { ...(existingRaw as Record<string, unknown>) }
      : {};
  return { ...base, storefrontSeo: config };
}

export function readEntitySeo(
  config: StorefrontSeoConfig,
  key: string,
): EntitySeoSettings | undefined {
  if (key === "home") return config.home;
  return config.entities?.[key];
}

export function writeEntitySeo(
  config: StorefrontSeoConfig,
  key: string,
  settings: EntitySeoSettings | null,
): StorefrontSeoConfig {
  if (key === "home") {
    return { ...config, home: settings ?? undefined };
  }
  const entities = { ...(config.entities ?? {}) };
  if (!settings || emptySeoSettings(settings)) {
    delete entities[key];
  } else {
    entities[key] = sanitizeSeoSettings(settings);
  }
  return {
    ...config,
    entities: Object.keys(entities).length > 0 ? entities : undefined,
  };
}

function emptySeoSettings(s: EntitySeoSettings): boolean {
  return (
    !s.seoTitle?.trim() &&
    !s.seoDescription?.trim() &&
    !s.ogTitle?.trim() &&
    !s.ogDescription?.trim() &&
    !s.ogImageUrl?.trim() &&
    (!s.robots || s.robots === "default")
  );
}

export function sanitizeSeoSettings(input: EntitySeoSettings): EntitySeoSettings {
  return {
    seoTitle: input.seoTitle?.trim().slice(0, 120) || undefined,
    seoDescription: input.seoDescription?.trim().slice(0, 320) || undefined,
    ogTitle: input.ogTitle?.trim().slice(0, 120) || undefined,
    ogDescription: input.ogDescription?.trim().slice(0, 320) || undefined,
    ogImageUrl: input.ogImageUrl?.trim().slice(0, 500) || undefined,
    robots:
      input.robots === "index" || input.robots === "noindex" ? input.robots : "default",
  };
}

export type SeoDefaults = {
  title: string;
  description: string;
  ogImageUrl?: string | null;
};

export function resolveSeoFields(
  defaults: SeoDefaults,
  stored?: EntitySeoSettings,
): {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl?: string | null;
  robots: SeoRobotsMode;
} {
  const title = stored?.seoTitle?.trim() || defaults.title;
  const description = stored?.seoDescription?.trim() || defaults.description;
  return {
    title,
    description,
    ogTitle: stored?.ogTitle?.trim() || title,
    ogDescription: stored?.ogDescription?.trim() || description,
    ogImageUrl: stored?.ogImageUrl?.trim() || defaults.ogImageUrl,
    robots: stored?.robots ?? "default",
  };
}

export function seoRobotsIndex(
  robots: SeoRobotsMode,
  published: boolean,
): boolean {
  if (robots === "noindex") return false;
  if (robots === "index") return true;
  return published;
}
