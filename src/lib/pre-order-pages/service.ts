import { revalidatePath } from "next/cache";
import { HandoverMode, PaymentTiming } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { preOrderPagePath } from "@/lib/preorder-page";
import { upsertPreOrderAddonProduct } from "@/lib/preorder-upsell-addon";
import { clearOrphanedPreOrderFlags } from "./orphans";

type Result = { ok: true } | { error: string };
const NOT_FOUND = { error: "Pre-order page not found." } as const;

/** Pages for one business, soonest collection first. */
export function listOwnerPreOrderPages(ownerId: string, standId: string) {
  return prisma.preOrderPage.findMany({
    where: { standId, ownerId },
    orderBy: [{ collectionAt: "asc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      isActive: true,
      orderByAt: true,
      collectionAt: true,
      stand: { select: { slug: true, timezone: true } },
      _count: { select: { items: true } },
    },
  });
}
export type OwnerPreOrderPageRow = Awaited<ReturnType<typeof listOwnerPreOrderPages>>[number];

/** One page with its products in page order. */
export function getOwnerPreOrderPage(ownerId: string, pageId: string) {
  return prisma.preOrderPage.findFirst({
    where: { id: pageId, ownerId },
    select: {
      id: true,
      title: true,
      slug: true,
      isActive: true,
      orderByAt: true,
      collectionAt: true,
      collectionNote: true,
      paymentTiming: true,
      depositPercent: true,
      handoverMode: true,
      stand: { select: { slug: true, timezone: true, currency: true, name: true } },
      _count: { select: { items: true } },
      items: {
        orderBy: { sortOrder: "asc" },
        select: {
          product: {
            select: { id: true, name: true, priceCents: true, stockQuantity: true, imageUrl: true, isHidden: true },
          },
        },
      },
    },
  });
}
export type OwnerPreOrderPage = NonNullable<Awaited<ReturnType<typeof getOwnerPreOrderPage>>>;

function revalidatePage(standSlug: string, pageId: string, pageSlug: string) {
  revalidatePath("/dashboard/pre-order-pages");
  revalidatePath(`/dashboard/pre-order-pages/${pageId}`);
  revalidatePath("/dashboard/products");
  revalidatePath(`/s/${standSlug}`);
  revalidatePath(preOrderPagePath(standSlug, pageSlug));
}

/** Take the page off (or back on) the shop without changing anything else. */
export async function setOwnerPreOrderPageActive(ownerId: string, pageId: string, isActive: boolean): Promise<Result> {
  const page = await prisma.preOrderPage.findFirst({
    where: { id: pageId, ownerId },
    select: { id: true, slug: true, stand: { select: { slug: true } } },
  });
  if (!page) return NOT_FOUND;
  await prisma.preOrderPage.update({ where: { id: page.id }, data: { isActive } });
  revalidatePage(page.stand.slug, page.id, page.slug);
  return { ok: true };
}

/** Deletes the page and its add-on product; products left on no page stop being pre-order products. */
export async function deleteOwnerPreOrderPage(ownerId: string, pageId: string): Promise<Result> {
  const existing = await prisma.preOrderPage.findFirst({
    where: { id: pageId, ownerId },
    include: {
      stand: { select: { slug: true, currency: true, id: true } },
      items: { select: { productId: true } },
    },
  });
  if (!existing) return NOT_FOUND;

  if (existing.preOrderUpsellProductId) {
    await upsertPreOrderAddonProduct({
      standId: existing.stand.id,
      ownerId,
      existingProductId: existing.preOrderUpsellProductId,
      name: null,
      priceCents: null,
      defaults: {
        orderByAt: null,
        collectionAt: null,
        collectionNote: null,
        paymentTiming: PaymentTiming.PAY_UPFRONT,
        depositPercent: null,
        handoverMode: HandoverMode.COLLECT,
        currency: existing.stand.currency,
        showExactStock: false,
      },
    });
  }

  const productIds = existing.items.map((i) => i.productId);
  await prisma.$transaction(async (tx) => {
    await tx.preOrderPage.delete({ where: { id: existing.id } });
    await clearOrphanedPreOrderFlags(tx, productIds);
  });
  revalidatePage(existing.stand.slug, existing.id, existing.slug);
  return { ok: true };
}
