import { prisma } from "@/lib/prisma";

/** Variant products keep stock per variant, so product-level stock edits don't apply. */
export async function productHasVariants(productId: string): Promise<boolean> {
  return (await prisma.productVariant.count({ where: { productId } })) > 0;
}
