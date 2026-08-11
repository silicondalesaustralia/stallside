import { prisma } from "@/lib/prisma";
import {
  HandoverMode,
  PaymentTiming,
} from "@/generated/prisma/client";
import { uniqueProductSlug, slugify } from "@/lib/slug";

export type PreOrderAddonDefaults = {
  orderByAt: Date | null;
  collectionAt: Date | null;
  collectionNote: string | null;
  paymentTiming: PaymentTiming;
  depositPercent: number | null;
  handoverMode: HandoverMode;
  currency: string;
  showExactStock: boolean;
};

/** Create/update a hidden product used as a pre-order cart add-on. */
export async function upsertPreOrderAddonProduct(input: {
  standId: string;
  ownerId: string;
  existingProductId: string | null;
  name: string | null;
  priceCents: number | null;
  defaults: PreOrderAddonDefaults;
}): Promise<
  | { ok: true; productId: string | null }
  | { ok: false; error: string }
> {
  const name = input.name?.trim() || null;
  if (!name || input.priceCents == null || input.priceCents < 0) {
    if (input.existingProductId) {
      await prisma.product.updateMany({
        where: { id: input.existingProductId, standId: input.standId },
        data: { isArchived: true, isActive: false },
      });
    }
    return { ok: true, productId: null };
  }

  const data = {
    name,
    priceCents: input.priceCents,
    currency: input.defaults.currency,
    stockQuantity: 99999,
    lowStockThreshold: 0,
    isHidden: true,
    isActive: true,
    isArchived: false,
    isPreOrder: true,
    orderByAt: input.defaults.orderByAt,
    collectionAt: input.defaults.collectionAt,
    collectionNote: input.defaults.collectionNote,
    showExactStock: input.defaults.showExactStock,
    paymentTiming:
      input.defaults.paymentTiming === PaymentTiming.DEPOSIT_THEN_BALANCE
        ? PaymentTiming.DEPOSIT_THEN_BALANCE
        : PaymentTiming.PAY_UPFRONT,
    depositPercent: input.defaults.depositPercent,
    handoverMode: input.defaults.handoverMode,
  };

  if (input.existingProductId) {
    const existing = await prisma.product.findFirst({
      where: { id: input.existingProductId, standId: input.standId },
      select: { id: true },
    });
    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data,
      });
      return { ok: true, productId: existing.id };
    }
  }

  const baseSlug = slugify(`addon-${name}`) || "addon";
  const slug = await uniqueProductSlug(input.standId, baseSlug, async (sid, s) => {
    const hit = await prisma.product.findFirst({
      where: { standId: sid, slug: s },
      select: { id: true },
    });
    return Boolean(hit);
  });

  const created = await prisma.product.create({
    data: {
      standId: input.standId,
      ownerId: input.ownerId,
      slug,
      ...data,
    },
  });
  return { ok: true, productId: created.id };
}

export function addonDefaultsFromProduct(p: {
  orderByAt: Date | null;
  collectionAt: Date | null;
  collectionNote: string | null;
  paymentTiming: PaymentTiming;
  depositPercent: number | null;
  handoverMode: HandoverMode;
  currency: string;
  showExactStock: boolean;
}): PreOrderAddonDefaults {
  return {
    orderByAt: p.orderByAt,
    collectionAt: p.collectionAt,
    collectionNote: p.collectionNote,
    paymentTiming: p.paymentTiming,
    depositPercent: p.depositPercent,
    handoverMode: p.handoverMode,
    currency: p.currency,
    showExactStock: p.showExactStock,
  };
}

export async function firstPreOrderDefaultsForStand(
  standId: string,
  currency: string,
): Promise<PreOrderAddonDefaults | null> {
  const p = await prisma.product.findFirst({
    where: {
      standId,
      isArchived: false,
      isPreOrder: true,
      orderByAt: { not: null },
      collectionAt: { not: null },
    },
    orderBy: { sortOrder: "asc" },
  });
  if (!p) return null;
  return addonDefaultsFromProduct({ ...p, currency: p.currency || currency });
}
