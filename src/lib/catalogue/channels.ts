import { prisma } from "@/lib/prisma";
import { ProductChannelType } from "@/generated/prisma/client";
import { productOnStandWhere } from "@/lib/catalogue/product-on-stand";
import type { Prisma } from "@/generated/prisma/client";

const optionInclude = {
  optionGroups: {
    orderBy: { sortOrder: "asc" as const },
    include: { choices: { orderBy: { sortOrder: "asc" as const } } },
  },
} as const;

/** Owner's primary public surface — oldest stand. */
export async function primaryStandIdForOwner(
  ownerId: string,
): Promise<string | null> {
  const stand = await prisma.stand.findFirst({
    where: { ownerId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return stand?.id ?? null;
}

/**
 * Stand + online for the product's stand. Online is always on: the website sells
 * from the chosen website stand, and there is no separate "sell online" toggle.
 */
export async function ensureDefaultProductChannels(input: {
  productId: string;
  standId: string;
  ownerId: string;
}) {
  void input.ownerId;
  const rows: {
    productId: string;
    channelType: ProductChannelType;
    standId: string;
    isEnabled: boolean;
  }[] = [
    {
      productId: input.productId,
      channelType: ProductChannelType.STAND,
      standId: input.standId,
      isEnabled: true,
    },
    {
      productId: input.productId,
      channelType: ProductChannelType.ONLINE,
      standId: input.standId,
      isEnabled: true,
    },
  ];

  for (const row of rows) {
    await prisma.productChannel.upsert({
      where: {
        productId_channelType_standId: {
          productId: row.productId,
          channelType: row.channelType,
          standId: row.standId,
        },
      },
      create: row,
      update: { isEnabled: true },
    });
  }
}

/** Heals missing ONLINE rows for live products on a stand (e.g. after publish). */
export async function ensureOnlineChannelsForStand(standId: string) {
  const products = await prisma.product.findMany({
    where: { standId, isArchived: false },
    select: { id: true, ownerId: true },
  });
  for (const p of products) {
    await ensureDefaultProductChannels({
      productId: p.id,
      standId,
      ownerId: p.ownerId,
    });
  }
  return products.length;
}

export async function listProductsForStandCatalog(
  standId: string,
  visibility: Prisma.ProductWhereInput,
  orderBy: Prisma.ProductOrderByWithRelationInput[] = [
    { sortOrder: "asc" },
    { name: "asc" },
  ],
) {
  return prisma.product.findMany({
    where: {
      AND: [visibility, productOnStandWhere(standId)],
    },
    orderBy,
    include: optionInclude,
  });
}

/**
 * Website catalogue for the chosen website stand — same membership as the
 * farm-stand catalog (legacy standId or an enabled STAND/ONLINE channel).
 */
export async function listProductsForOnlineShop(
  ownerId: string,
  standId: string,
  visibility: Prisma.ProductWhereInput,
) {
  return prisma.product.findMany({
    where: {
      AND: [{ ownerId }, visibility, productOnStandWhere(standId)],
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: optionInclude,
  });
}

export async function resolveProductForStand(input: {
  standId: string;
  slug?: string;
  productId?: string;
  visibility: Prisma.ProductWhereInput;
}) {
  const identity = input.productId
    ? { id: input.productId }
    : input.slug
      ? { slug: input.slug }
      : null;
  if (!identity) return null;

  return prisma.product.findFirst({
    where: {
      AND: [identity, input.visibility, productOnStandWhere(input.standId)],
    },
    include: optionInclude,
  });
}
