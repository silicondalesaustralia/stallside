"use server";

import { revalidatePath } from "next/cache";
import { InventorySource } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSupplier } from "@/lib/suppliers/access";
import { notifySupplierStock } from "@/lib/suppliers/notify-stock";

export async function adjustSupplierStock(formData: FormData) {
  const standId = String(formData.get("standId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const mode = String(formData.get("mode") ?? "increase");
  const amount = Number.parseInt(String(formData.get("amount") ?? ""), 10);
  const { membership } = await requireSupplier(standId);
  if (!productId || !Number.isInteger(amount) || amount < 1) {
    return { error: "Enter a quantity." };
  }
  if (mode !== "increase" && mode !== "decrease") {
    return { error: "Choose add or remove." };
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      memberId: membership.id,
      standId: membership.standId,
    },
  });
  if (!product) return { error: "Product not found." };

  const previous = product.stockQuantity;
  const next =
    mode === "increase" ? previous + amount : Math.max(0, previous - amount);
  const change = next - previous;
  if (change === 0) return { error: "Stock is already zero." };

  try {
    await prisma.$transaction([
      prisma.product.update({
        where: { id: product.id },
        data: { stockQuantity: next },
      }),
      prisma.inventoryAdjustment.create({
        data: {
          productId: product.id,
          ownerId: membership.stand.ownerId,
          standId: membership.standId,
          memberId: membership.id,
          changeQuantity: change,
          previousQuantity: previous,
          newQuantity: next,
          reason: `${membership.name} updated stock`,
          source: InventorySource.OWNER_MANUAL,
        },
      }),
    ]);
    try {
      await notifySupplierStock({
        ownerId: membership.stand.ownerId,
        standId: membership.standId,
        standName: membership.stand.name,
        timezone: membership.stand.timezone,
        memberName: membership.name,
        productId: product.id,
        productName: product.name,
        changeQuantity: change,
        at: new Date(),
      });
    } catch (error) {
      console.error("Supplier stock notify failed", error);
    }
  } catch (error) {
    console.error("Supplier stock adjust failed", error);
    return { error: "Could not update stock." };
  }

  revalidatePath("/supply");
  revalidatePath("/dashboard/suppliers");
  revalidatePath(`/dashboard/products/${product.id}`);
  return { ok: true as const };
}
