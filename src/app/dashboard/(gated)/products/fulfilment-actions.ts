"use server";

import { revalidatePath } from "next/cache";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  FulfilmentOptionKind,
} from "@/generated/prisma/client";

export async function saveProductFulfilmentOptions(
  productId: string,
  rows: { optionId: string; enabled: boolean }[],
) {
  const { owner } = await requireOwnerWrite();
  const product = await prisma.product.findFirst({
    where: { id: productId, ownerId: owner.id },
    select: { id: true },
  });
  if (!product) return { error: "Product not found." };

  const validOptions = await prisma.fulfilmentOption.findMany({
    where: {
      ownerId: owner.id,
      id: { in: rows.map((r) => r.optionId) },
      isActive: true,
      kind: {
        in: [FulfilmentOptionKind.PICKUP, FulfilmentOptionKind.DELIVERY],
      },
    },
    select: { id: true },
  });
  const validIds = new Set(validOptions.map((o) => o.id));

  await prisma.$transaction(async (tx) => {
    await tx.productFulfilmentOption.deleteMany({
      where: { productId, fulfilmentOptionId: { in: [...validIds] } },
    });
    const enabled = rows.filter((r) => validIds.has(r.optionId) && r.enabled);
    if (enabled.length > 0 && enabled.length < validIds.size) {
      await tx.productFulfilmentOption.createMany({
        data: enabled.map((r) => ({
          productId,
          fulfilmentOptionId: r.optionId,
          isEnabled: true,
        })),
      });
    }
  });

  revalidatePath(`/dashboard/products/${productId}`);
  return { ok: true as const };
}
