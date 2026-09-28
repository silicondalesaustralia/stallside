"use server";

import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  revalidateOwnerStores,
  validOrderedIds,
  type OrderActionResult,
} from "@/lib/categories/category-admin";

/** Order of products on the main shop page (Product.sortOrder). */
export async function saveProductOrder(raw: string[]): Promise<OrderActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const ids = validOrderedIds(raw);
    if (!ids) return { error: "Invalid order." };
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.product.updateMany({
          where: { id, ownerId: owner.id },
          data: { sortOrder: index },
        }),
      ),
    );
    await revalidateOwnerStores(owner.id);
    return { ok: true };
  } catch (error) {
    console.error("saveProductOrder failed", error);
    return { error: "Could not save order." };
  }
}
