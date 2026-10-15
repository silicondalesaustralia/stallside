"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { standCatalogTag } from "@/lib/stand-catalog-tag";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";

/** Deletes a product for good. Ordered products can only be unpublished, so order history stays intact. */
export async function deleteProductForever(productId: string): Promise<{ ok: true } | { error: string }> {
  const { owner } = await requireOwnerWrite();
  const product = await prisma.product.findFirst({
    where: { id: productId, ownerId: owner.id },
    select: { id: true, slug: true, memberId: true, standId: true, stand: { select: { slug: true } } },
  });
  if (!product) return { error: "Product not found." };
  if (product.memberId) return { error: "Supplier products are removed from Suppliers." };

  const ordered = await prisma.orderItem.count({ where: { productId: product.id } });
  if (ordered > 0) {
    return { error: "This product has orders, so it can't be deleted. Unpublish it to keep it as a draft." };
  }
  try {
    await prisma.product.delete({ where: { id: product.id } });
  } catch (err) {
    console.error("deleteProductForever failed", err);
    return { error: "Could not delete this product. Unpublish it instead." };
  }

  revalidatePath("/dashboard/products");
  revalidatePath(`/dashboard/businesses/${product.standId}`);
  revalidatePath(`/s/${product.stand.slug}`);
  revalidateTag(standCatalogTag(product.stand.slug), "max");
  return { ok: true };
}
