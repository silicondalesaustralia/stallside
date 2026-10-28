import type { Prisma } from "@/generated/prisma/client";

type Tx = Prisma.TransactionClient;

/**
 * Keeps Product.stockQuantity equal to its active variants' total and
 * Product.priceCents at the lowest variant price ("from" price in lists).
 * No-op for products without variants.
 */
export async function syncProductFromVariants(tx: Tx, productId: string) {
  const variants = await tx.productVariant.findMany({
    where: { productId, isActive: true },
    select: { stockQuantity: true, priceCents: true },
  });
  if (variants.length === 0) return;
  const stockQuantity = variants.reduce((sum, v) => sum + v.stockQuantity, 0);
  const priceCents = Math.min(...variants.map((v) => v.priceCents));
  await tx.product.update({
    where: { id: productId },
    data: { stockQuantity, priceCents },
  });
}

/** Adds stock back to the variants on an order's lines (refunds, cancels, expiries). */
export async function restockOrderVariants(
  tx: Tx,
  lines: { variantId: string | null; quantity: number }[],
) {
  for (const line of lines) {
    if (!line.variantId) continue;
    await tx.productVariant.updateMany({
      where: { id: line.variantId },
      data: { stockQuantity: { increment: line.quantity } },
    });
  }
}

/** Takes stock from the variants on an order's lines; throws "STOCK" when short. */
export async function decrementOrderVariants(
  tx: Tx,
  lines: { variantId: string | null; quantity: number }[],
) {
  for (const line of lines) {
    if (!line.variantId) continue;
    const updated = await tx.productVariant.updateMany({
      where: { id: line.variantId, stockQuantity: { gte: line.quantity } },
      data: { stockQuantity: { decrement: line.quantity } },
    });
    if (updated.count !== 1) throw new Error("STOCK");
  }
}
