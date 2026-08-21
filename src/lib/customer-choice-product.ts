import { prisma } from "@/lib/prisma";
import { uniqueProductSlug, slugify } from "@/lib/slug";
import { CUSTOMER_CHOICE_PRODUCT_NAME } from "@/lib/customer-choice-constants";

export { CUSTOMER_CHOICE_PRODUCT_NAME } from "@/lib/customer-choice-constants";

/** Create/reactivate the hidden sentinel product used for open-amount checkout. */
export async function ensureCustomerChoiceProduct(input: {
  standId: string;
  ownerId: string;
  currency: string;
  existingProductId: string | null;
}): Promise<{ ok: true; productId: string } | { ok: false; error: string }> {
  const data = {
    name: CUSTOMER_CHOICE_PRODUCT_NAME,
    priceCents: 0,
    currency: input.currency,
    stockQuantity: 99999,
    lowStockThreshold: 0,
    isHidden: true,
    isActive: true,
    isArchived: false,
    isPreOrder: false,
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

  const baseSlug = slugify("customer-choice") || "customer-choice";
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

/** Soft-disable the sentinel when switching back to Product cart. */
export async function archiveCustomerChoiceProduct(
  standId: string,
  productId: string | null,
): Promise<void> {
  if (!productId) return;
  await prisma.product.updateMany({
    where: { id: productId, standId },
    data: { isArchived: true, isActive: false },
  });
}
