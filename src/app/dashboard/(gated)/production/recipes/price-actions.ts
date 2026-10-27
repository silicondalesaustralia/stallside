"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwnerWrite } from "@/lib/session";
import { standCatalogTag } from "@/lib/stand-catalog-tag";
import { formatMoney } from "@/lib/money";
import { failure, text, wholeNumber, type ActionResult } from "@/lib/production/form-parse";

/** Saves a calculator price (and the recipe unit cost) onto the product. */
export async function saveProductPricing(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const productId = text(formData, "productId");
    const priceCents = wholeNumber(formData, "priceCents");
    const costCents = wholeNumber(formData, "costCents");
    if (priceCents == null || priceCents <= 0) return { error: "Enter a price above zero." };

    const product = await prisma.product.findFirst({
      where: { id: productId, ownerId: owner.id },
      select: { id: true, slug: true, standId: true, currency: true, compareAtPriceCents: true, stand: { select: { slug: true } } },
    });
    if (!product) return { error: "Product not found." };
    const endsSale = product.compareAtPriceCents != null && product.compareAtPriceCents <= priceCents;

    await prisma.product.update({
      where: { id: product.id },
      data: {
        priceCents,
        ...(costCents == null ? {} : { costCents }),
        ...(endsSale ? { compareAtPriceCents: null } : {}),
      },
    });

    revalidatePath("/dashboard/production", "layout");
    revalidatePath("/dashboard/products");
    revalidatePath(`/dashboard/products/${product.id}`);
    revalidatePath(`/dashboard/businesses/${product.standId}`);
    revalidatePath("/dashboard/pre-order-pages");
    revalidatePath(`/s/${product.stand.slug}`);
    revalidatePath(`/s/${product.stand.slug}/${product.slug}`);
    revalidateTag(standCatalogTag(product.stand.slug), "max");
    const price = formatMoney(priceCents, product.currency);
    return {
      ok: true,
      message: endsSale ? `Price set to ${price}. The "was" price was removed because it's no longer higher.` : `Price set to ${price}.`,
    };
  } catch (error) {
    return failure("saveProductPricing failed", error);
  }
}
