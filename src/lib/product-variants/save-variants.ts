import type { Prisma } from "@/generated/prisma/client";
import type { VariantsPayload } from "./parse-variants-input";
import { syncProductFromVariants } from "./sync-product-total";

type Tx = Prisma.TransactionClient;

const keyOf = (values: (string | null)[]) =>
  values.map((v) => (v ?? "").trim().toLowerCase()).join("|");

/**
 * Replaces a product's variants with the payload, matching existing rows by
 * option values so their ids (and order history links) survive edits.
 */
export async function saveVariants(tx: Tx, productId: string, data: VariantsPayload) {
  const [n1, n2, n3] = data.optionNames;
  await tx.product.update({
    where: { id: productId },
    data: {
      option1Name: data.variants.length ? (n1 ?? null) : null,
      option2Name: data.variants.length ? (n2 ?? null) : null,
      option3Name: data.variants.length ? (n3 ?? null) : null,
    },
  });

  const existing = await tx.productVariant.findMany({ where: { productId } });
  const byKey = new Map(existing.map((v) => [keyOf([v.option1, v.option2, v.option3]), v]));
  const keep = new Set<string>();

  for (let i = 0; i < data.variants.length; i++) {
    const v = data.variants[i];
    const fields = {
      option1: v.values[0] ?? null,
      option2: v.values[1] ?? null,
      option3: v.values[2] ?? null,
      sku: v.sku,
      priceCents: v.priceCents,
      stockQuantity: v.stockQuantity,
      ...(v.upc !== undefined ? { upc: v.upc || null } : {}),
      ...(v.compareAtCents !== undefined ? { compareAtCents: v.compareAtCents } : {}),
      ...(v.costCents !== undefined ? { costCents: v.costCents } : {}),
      ...(v.imageUrl !== undefined ? { imageUrl: v.imageUrl || null } : {}),
      isActive: true,
      sortOrder: i,
    };
    const match = byKey.get(keyOf(v.values));
    if (match) {
      keep.add(match.id);
      await tx.productVariant.update({ where: { id: match.id }, data: fields });
    } else {
      await tx.productVariant.create({ data: { productId, ...fields } });
    }
  }

  const removed = existing.filter((v) => !keep.has(v.id)).map((v) => v.id);
  if (removed.length) {
    await tx.productVariant.deleteMany({ where: { id: { in: removed } } });
  }
  await syncProductFromVariants(tx, productId);
}
