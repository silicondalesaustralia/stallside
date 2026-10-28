"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { standCatalogTag } from "@/lib/stand-catalog-tag";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { parseVariantsInput } from "@/lib/product-variants/parse-variants-input";
import { saveVariants } from "@/lib/product-variants/save-variants";

export async function saveProductVariants(productId: string, raw: unknown) {
  try {
    const { owner } = await requireOwnerWrite();
    const product = await prisma.product.findFirst({
      where: { id: productId, ownerId: owner.id },
      select: {
        id: true,
        slug: true,
        isPreOrder: true,
        stand: { select: { slug: true } },
        _count: { select: { stockLots: true } },
      },
    });
    if (!product) return { error: "Product not found." };

    const parsed = parseVariantsInput(raw);
    if (!parsed.ok) return { error: parsed.error };
    const adding = parsed.data.variants.length > 0;
    if (adding && product.isPreOrder) {
      return { error: "Pre-order products can't have variants yet." };
    }
    if (adding && product._count.stockLots > 0) {
      return { error: "Products with supplier stock can't have variants yet." };
    }

    await prisma.$transaction(async (tx) => {
      await saveVariants(tx, product.id, parsed.data);
      if (adding) {
        await tx.product.update({
          where: { id: product.id },
          data: { priceTiers: Prisma.DbNull },
        });
      }
    });

    revalidatePath(`/dashboard/products/${product.id}`);
    revalidatePath("/dashboard/inventory");
    revalidateTag(standCatalogTag(product.stand.slug), "max");
    revalidatePath(`/s/${product.stand.slug}/${product.slug}`);
    return { ok: true as const };
  } catch (error) {
    console.error("saveProductVariants failed", error);
    return { error: "Could not save variants." };
  }
}
