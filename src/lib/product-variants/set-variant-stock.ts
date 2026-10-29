import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { revalidateProductPaths } from "@/lib/products/lifecycle";
import { syncProductFromVariants } from "./sync-product-total";

type Result = { ok: true } | { error: string };

const MAX_STOCK = 1_000_000;

/** Sets one variant's stock and keeps the product total in step, as the web variant editor does. */
export async function setOwnerVariantStock(
  ownerId: string,
  productId: string,
  variantId: string,
  quantity: number,
): Promise<Result> {
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_STOCK) {
    return { error: "Invalid stock quantity." };
  }
  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, productId, product: { ownerId } },
    select: {
      id: true,
      product: { select: { id: true, slug: true, standId: true, stand: { select: { slug: true } } } },
    },
  });
  if (!variant) return { error: "Variant not found." };

  await prisma.$transaction(async (tx) => {
    await tx.productVariant.update({ where: { id: variant.id }, data: { stockQuantity: quantity } });
    await syncProductFromVariants(tx, variant.product.id);
  });

  const { product } = variant;
  revalidateProductPaths({
    standId: product.standId,
    standSlug: product.stand.slug,
    productId: product.id,
    slug: product.slug,
  });
  revalidatePath("/dashboard/inventory");
  return { ok: true };
}
