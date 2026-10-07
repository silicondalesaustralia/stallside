import { HandoverMode, PaymentTiming } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { uniqueProductSlug, slugify } from "@/lib/slug";

/** Create/update a hidden product used as OrderItem target for memberships. */
export async function upsertMembershipFulfilmentProduct(input: {
  standId: string;
  ownerId: string;
  existingProductId: string | null;
  title: string;
  priceCents: number;
  currency: string;
  handoverMode: HandoverMode;
  collectionNote: string | null;
}): Promise<string> {
  const name = input.title.trim().slice(0, 120) || "Membership";
  const data = {
    name,
    priceCents: Math.max(0, input.priceCents),
    currency: input.currency,
    stockQuantity: 99999,
    lowStockThreshold: 0,
    isHidden: true,
    isActive: true,
    isArchived: false,
    isPreOrder: true,
    showExactStock: false,
    paymentTiming: PaymentTiming.PAY_UPFRONT,
    handoverMode: input.handoverMode,
    collectionNote: input.collectionNote,
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
      return existing.id;
    }
  }

  const baseSlug = slugify(`membership-${name}`) || "membership";
  const slug = await uniqueProductSlug(
    input.standId,
    baseSlug,
    async (sid, s) => {
      const hit = await prisma.product.findFirst({
        where: { standId: sid, slug: s },
        select: { id: true },
      });
      return Boolean(hit);
    },
  );

  const created = await prisma.product.create({
    data: {
      standId: input.standId,
      ownerId: input.ownerId,
      slug,
      ...data,
    },
  });
  return created.id;
}
