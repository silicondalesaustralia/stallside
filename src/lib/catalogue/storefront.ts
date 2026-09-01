import { prisma } from "@/lib/prisma";
import { slugify, uniqueStandSlug } from "@/lib/slug";
import { businessPageProductWhere } from "@/lib/product-visibility";
import {
  listProductsForOnlineShop,
  primaryStandIdForOwner,
} from "@/lib/catalogue/channels";
import { appBaseUrl } from "@/lib/app-url";
import { normalizeBusinessMode } from "@/lib/business-mode";
import {
  buildDefaultStorefrontConfig,
  parseStorefrontConfig,
} from "@/lib/storefront/config";
import { resolveStorefrontBranding } from "@/lib/storefront/branding";
import { loadOnlineFulfilmentOptions } from "@/lib/fulfilment/load-options";
import { toShopFulfilmentOptionView } from "@/lib/fulfilment/shop-types";
import type { StorefrontConfig } from "@/lib/storefront/types";
import { ProductChannelType, Prisma } from "@/generated/prisma/client";

const ownerInclude = {
  user: { select: { email: true, role: true } },
  stands: { orderBy: { createdAt: "asc" as const }, take: 1 },
} as const;

export async function uniqueStorefrontSlug(
  base: string,
  excludeOwnerId?: string,
): Promise<string> {
  const exists = async (slug: string) => {
    const hit = await prisma.storefront.findFirst({
      where: {
        slug,
        ...(excludeOwnerId ? { NOT: { ownerId: excludeOwnerId } } : {}),
      },
      select: { id: true },
    });
    if (hit) return true;
    const stand = await prisma.stand.findFirst({
      where: { slug },
      select: { id: true },
    });
    return Boolean(stand);
  };
  return uniqueStandSlug(base, exists);
}

export async function ensureStorefront(ownerId: string, businessName: string) {
  const existing = await prisma.storefront.findUnique({ where: { ownerId } });
  if (existing) {
    const raw = existing.draftConfig;
    const empty =
      raw == null ||
      (typeof raw === "object" &&
        !Array.isArray(raw) &&
        Object.keys(raw as object).length === 0);
    if (empty) {
      const owner = await prisma.owner.findUniqueOrThrow({
        where: { id: ownerId },
        select: { businessMode: true, fulfilmentIntents: true },
      });
      const draftConfig = buildDefaultStorefrontConfig({
        businessMode: normalizeBusinessMode(owner.businessMode),
        fulfilmentIntents: owner.fulfilmentIntents,
      });
      return prisma.storefront.update({
        where: { ownerId },
        data: {
          draftConfig: draftConfig as unknown as Prisma.InputJsonValue,
        },
      });
    }
    return existing;
  }

  const owner = await prisma.owner.findUniqueOrThrow({
    where: { id: ownerId },
    select: {
      businessMode: true,
      fulfilmentIntents: true,
      shortDescription: true,
      businessName: true,
    },
  });

  const mode = normalizeBusinessMode(owner.businessMode);
  const draftConfig = buildDefaultStorefrontConfig({
    businessMode: mode,
    fulfilmentIntents: owner.fulfilmentIntents,
  });

  const slug = await uniqueStorefrontSlug(businessName || "shop");
  return prisma.storefront.create({
    data: {
      ownerId,
      slug,
      headline: owner.businessName,
      subheadline: owner.shortDescription,
      about: owner.shortDescription,
      isPublished: false,
      draftConfig: draftConfig as unknown as Prisma.InputJsonValue,
    },
  });
}

export type StorefrontContext = Awaited<ReturnType<typeof loadStorefrontContext>>;

export async function loadStorefrontContext(
  slug: string,
  options: { draft?: boolean; ownerId?: string } = {},
) {
  const key = decodeURIComponent(slug).trim().toLowerCase();
  const storefront = await prisma.storefront.findFirst({
    where: { slug: key },
    include: { owner: { include: ownerInclude } },
  });
  if (!storefront) return null;

  const isOwnerPreview =
    Boolean(options.draft) &&
    Boolean(options.ownerId) &&
    options.ownerId === storefront.ownerId;

  if (options.draft && !isOwnerPreview) return null;
  if (!options.draft && !storefront.isPublished) return null;

  const stand = storefront.owner.stands[0];
  if (!stand?.isActive) return null;

  const config = parseStorefrontConfig(
    options.draft || !storefront.publishedConfig
      ? storefront.draftConfig
      : storefront.publishedConfig,
  );

  const branding = resolveStorefrontBranding({
    owner: storefront.owner,
    stand,
    storefront,
    config,
  });

  const [products, categories, onlineCount, fulfilmentOptions] = await Promise.all([
    listProductsForOnlineShop(
      storefront.ownerId,
      stand.id,
      businessPageProductWhere,
    ),
    prisma.category.findMany({
      where: {
        ownerId: storefront.ownerId,
        isActive: true,
        products: {
          some: {
            product: {
              isArchived: false,
              channels: {
                some: {
                  channelType: ProductChannelType.ONLINE,
                  standId: stand.id,
                  isEnabled: true,
                },
              },
            },
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: { id: true, slug: true, title: true, description: true, imageUrl: true },
    }),
    prisma.productChannel.count({
      where: {
        channelType: ProductChannelType.ONLINE,
        standId: stand.id,
        isEnabled: true,
        product: { ownerId: storefront.ownerId, isArchived: false },
      },
    }),
    loadOnlineFulfilmentOptions(storefront.ownerId).then((rows) =>
      rows.map(toShopFulfilmentOptionView),
    ),
  ]);

  return {
    storefront,
    owner: storefront.owner,
    stand,
    config,
    branding,
    products,
    categories,
    onlineCount,
    fulfilmentOptions,
    isDraftPreview: isOwnerPreview,
    businessMode: normalizeBusinessMode(storefront.owner.businessMode),
  };
}

/** @deprecated Use loadStorefrontContext */
export async function loadPublishedStorefront(slug: string) {
  return loadStorefrontContext(slug);
}

export function storefrontPublicPath(slug: string) {
  return `/shop/${encodeURIComponent(slug)}`;
}

export function storefrontFullUrl(slug: string, draft = false) {
  const path = storefrontPublicPath(slug);
  return `${appBaseUrl()}${path}${draft ? "?draft=1" : ""}`;
}

export function slugifyStorefrontInput(input: string) {
  return slugify(input) || "shop";
}

export async function saveStorefrontDraftData(input: {
  ownerId: string;
  headline: string;
  subheadline: string | null;
  about: string | null;
  slug: string;
  themePreset: string;
  contactEmail: string | null;
  showPhone: boolean;
  heroImageUrl?: string | null;
  draftConfig: StorefrontConfig;
}) {
  await prisma.storefront.update({
    where: { ownerId: input.ownerId },
    data: {
      headline: input.headline,
      subheadline: input.subheadline,
      about: input.about,
      slug: input.slug,
      themePreset: input.themePreset,
      contactEmail: input.contactEmail,
      showPhone: input.showPhone,
      ...(input.heroImageUrl !== undefined
        ? { heroImageUrl: input.heroImageUrl }
        : {}),
      draftConfig: input.draftConfig as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function publishStorefront(ownerId: string) {
  const sf = await prisma.storefront.findUniqueOrThrow({
    where: { ownerId },
  });
  await prisma.storefront.update({
    where: { ownerId },
    data: {
      isPublished: true,
      publishedConfig: sf.draftConfig as Prisma.InputJsonValue,
      publishedAt: new Date(),
    },
  });
}

export async function unpublishStorefront(ownerId: string) {
  await prisma.storefront.update({
    where: { ownerId },
    data: { isPublished: false },
  });
}
