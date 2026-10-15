import { prisma } from "@/lib/prisma";
import { slugify, uniqueStandSlug } from "@/lib/slug";
import { businessPageProductWhere } from "@/lib/product-visibility";
import {
  listProductsForOnlineShop,
  primaryStandIdForOwner,
} from "@/lib/catalogue/channels";
import { storefrontPublicUrl } from "@/lib/tenancy/public-url";
import { normalizeBusinessMode } from "@/lib/business-mode";
import { parseStorefrontConfig } from "@/lib/storefront/config";
import { pickWebsiteStand } from "@/lib/storefront/website-stand";
import { resolveStorefrontBranding } from "@/lib/storefront/branding";
import { loadOnlineFulfilmentOptions } from "@/lib/fulfilment/load-options";
import { toShopFulfilmentOptionView } from "@/lib/fulfilment/shop-types";
import { withMainCategorySlugs } from "@/lib/studio/product-main-category";
import { ProductChannelType, Prisma } from "@/generated/prisma/client";
import {
  SEED_OWNER_SELECT,
  buildSeededDraftConfig,
} from "@/lib/website/persistence/seed-draft";

const ownerInclude = {
  user: { select: { email: true, role: true } },
  stands: { orderBy: { createdAt: "asc" as const } },
} as const;

export async function uniqueStorefrontSlug(
  base: string,
  excludeOwnerId?: string,
): Promise<string> {
  const { isReservedVendlSubdomain } = await import(
    "@/lib/tenancy/reserved-subdomains"
  );
  const exists = async (slug: string) => {
    if (isReservedVendlSubdomain(slug)) return true;
    const hit = await prisma.storefront.findFirst({
      where: {
        slug,
        ...(excludeOwnerId ? { NOT: { ownerId: excludeOwnerId } } : {}),
      },
      select: { id: true },
    });
    if (hit) return true;
    // Same owner's stands share the brand URL space — don't block renaming
    // storefront slug to match their own stand.
    const stand = await prisma.stand.findFirst({
      where: {
        slug,
        ...(excludeOwnerId ? { NOT: { ownerId: excludeOwnerId } } : {}),
      },
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
        select: SEED_OWNER_SELECT,
      });
      await prisma.storefront.updateMany({
        where: { ownerId, draftRevision: existing.draftRevision },
        data: {
          draftConfig: buildSeededDraftConfig(owner) as unknown as Prisma.InputJsonValue,
          draftRevision: { increment: 1 },
        },
      });
      return prisma.storefront.findUniqueOrThrow({ where: { ownerId } });
    }
    return existing;
  }

  const owner = await prisma.owner.findUniqueOrThrow({
    where: { id: ownerId },
    select: SEED_OWNER_SELECT,
  });
  const draftConfig = buildSeededDraftConfig(owner);

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

  const stand = pickWebsiteStand(storefront.owner.stands, storefront.draftConfig);
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

  const [shopProducts, categories, onlineCount, fulfilmentOptions] = await Promise.all([
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
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        bottomDescription: true,
        imageUrl: true,
        showOnWebsite: true,
      },
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
  const products = await withMainCategorySlugs(shopProducts, categories);

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
  return storefrontPublicUrl(slug, { draft, forcePath: draft });
}

export function slugifyStorefrontInput(input: string) {
  return slugify(input) || "shop";
}

export { saveStorefrontDraftData } from "@/lib/website/persistence/draft-data";
export {
  publishStorefront,
  unpublishStorefront,
} from "@/lib/website/persistence/publish";
