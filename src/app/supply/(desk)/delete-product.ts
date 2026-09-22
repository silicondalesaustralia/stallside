"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSupplier } from "@/lib/suppliers/access";
import { standCatalogTag } from "@/lib/stand-catalog-tag";

/** Supplier archives their own exclusive product (not a linked owner product). */
export async function deleteOwnSupplierProduct(formData: FormData) {
  const standId = String(formData.get("standId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const { membership } = await requireSupplier(standId);
  if (!productId) return { error: "Product not found." };

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      memberId: membership.id,
      standId: membership.standId,
    },
    include: { stand: { select: { slug: true } } },
  });
  if (!product) return { error: "Product not found." };

  await prisma.product.update({
    where: { id: product.id },
    data: { isArchived: true, isActive: false, isHidden: false },
  });

  revalidatePath("/supply");
  revalidatePath("/dashboard/suppliers");
  revalidatePath(`/dashboard/suppliers/${membership.id}`);
  revalidatePath("/dashboard/products");
  revalidateTag(standCatalogTag(product.stand.slug), "max");
  return { ok: true as const };
}
