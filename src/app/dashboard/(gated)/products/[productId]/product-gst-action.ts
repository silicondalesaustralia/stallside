"use server";

import { revalidatePath } from "next/cache";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function setProductGstFree(
  productId: string,
  gstFree: boolean,
): Promise<{ ok: true } | { error: string }> {
  try {
    const { owner } = await requireOwnerWrite();
    const result = await prisma.product.updateMany({
      where: { id: productId, ownerId: owner.id },
      data: { gstFree },
    });
    if (result.count === 0) return { error: "Product not found." };
    revalidatePath(`/dashboard/products/${productId}`);
    return { ok: true };
  } catch (error) {
    console.error("setProductGstFree failed", error);
    return { error: "Could not save tax setting." };
  }
}
