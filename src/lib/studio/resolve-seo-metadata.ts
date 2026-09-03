import type { Metadata } from "next";
import type { ResolvedStorefrontBranding } from "@/lib/storefront/types";
import { storefrontPublicUrl } from "@/lib/tenancy/public-url";
import {
  extractStorefrontSeo,
  readEntitySeo,
  resolveSeoFields,
  seoRobotsIndex,
  type SeoDefaults,
  type SeoEntityType,
  entitySeoKey,
} from "./seo-settings";

export function seoConfigSource(
  draftConfig: unknown,
  publishedConfig: unknown | null,
  usePublished: boolean,
): unknown {
  return usePublished && publishedConfig ? publishedConfig : draftConfig;
}

export function resolveStorefrontEntitySeo(
  configRaw: unknown,
  entityType: SeoEntityType,
  entityId: string | undefined,
  defaults: SeoDefaults,
) {
  const config = extractStorefrontSeo(configRaw);
  const key = entitySeoKey(entityType, entityId);
  const stored = readEntitySeo(config, key);
  return resolveSeoFields(defaults, stored);
}

export async function buildStorefrontPageMetadata(input: {
  branding: ResolvedStorefrontBranding;
  slug: string;
  published: boolean;
  configRaw: unknown;
  entityType: SeoEntityType;
  entityId?: string;
  defaults: SeoDefaults;
  path?: string;
  primaryCustomHostname?: string | null;
}): Promise<Metadata> {
  const resolved = resolveStorefrontEntitySeo(
    input.configRaw,
    input.entityType,
    input.entityId,
    input.defaults,
  );

  const title = resolved.title.includes(input.branding.headline)
    ? resolved.title
    : `${resolved.title} · ${input.branding.headline}`;

  let primaryCustomHostname = input.primaryCustomHostname;
  if (primaryCustomHostname === undefined) {
    const { prisma } = await import("@/lib/prisma");
    const sf = await prisma.storefront.findFirst({
      where: { slug: input.slug.trim().toLowerCase() },
      select: { id: true },
    });
    if (sf) {
      const { loadPrimaryCustomHostname } = await import("@/lib/domains/resolve");
      primaryCustomHostname = await loadPrimaryCustomHostname(sf.id);
    }
  }

  const canonical = storefrontPublicUrl(input.slug, {
    path: input.path,
    primaryCustomHostname,
  });
  const index = seoRobotsIndex(resolved.robots, input.published);

  return {
    title,
    description: resolved.description,
    alternates: { canonical },
    robots: index ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title: resolved.ogTitle.includes(input.branding.headline)
        ? resolved.ogTitle
        : `${resolved.ogTitle} · ${input.branding.headline}`,
      description: resolved.ogDescription,
      url: canonical,
      siteName: input.branding.headline,
      type: "website",
      ...(resolved.ogImageUrl
        ? { images: [{ url: resolved.ogImageUrl }] }
        : input.branding.heroImageUrl || input.branding.logoUrl
          ? { images: [{ url: input.branding.heroImageUrl ?? input.branding.logoUrl! }] }
          : {}),
    },
  };
}

export function homeSeoDefaults(branding: ResolvedStorefrontBranding): SeoDefaults {
  return {
    title: branding.headline,
    description:
      branding.subheadline ??
      branding.about ??
      `Shop ${branding.headline} online.`,
    ogImageUrl: branding.heroImageUrl ?? branding.logoUrl,
  };
}
