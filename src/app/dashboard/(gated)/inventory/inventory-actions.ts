"use server";

import { revalidatePath } from "next/cache";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { InventorySource } from "@/generated/prisma/client";
import { notifyLowStockForProducts } from "@/lib/notify";
import { isSupplyStatus } from "@/lib/inventory/inventory-status";

type ActionResult = { ok: true; changed?: number } | { error: string };

/** Form fields `count:<productId>` = physically counted quantity (blank = skip). */
export async function applyStockCount(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const counts = new Map<string, number>();
    for (const [key, raw] of formData.entries()) {
      if (!key.startsWith("count:") || typeof raw !== "string" || raw.trim() === "") {
        continue;
      }
      const value = Number.parseInt(raw, 10);
      if (!Number.isFinite(value) || value < 0) {
        return { error: "Counts must be whole numbers of 0 or more." };
      }
      counts.set(key.slice("count:".length), value);
    }
    if (counts.size === 0) return { error: "Enter at least one count." };

    const products = await prisma.product.findMany({
      where: { ownerId: owner.id, id: { in: [...counts.keys()] } },
      select: { id: true, standId: true, stockQuantity: true, lowStockThreshold: true },
    });
    const changed = products.filter((p) => counts.get(p.id) !== p.stockQuantity);

    await prisma.$transaction(
      changed.flatMap((p) => {
        const next = counts.get(p.id) ?? p.stockQuantity;
        return [
          prisma.product.update({ where: { id: p.id }, data: { stockQuantity: next } }),
          prisma.inventoryAdjustment.create({
            data: {
              productId: p.id,
              ownerId: owner.id,
              standId: p.standId,
              changeQuantity: next - p.stockQuantity,
              previousQuantity: p.stockQuantity,
              newQuantity: next,
              reason: "Stock count",
              source: InventorySource.RECONCILIATION,
            },
          }),
        ];
      }),
    );

    const low = changed.filter((p) => (counts.get(p.id) ?? 0) <= p.lowStockThreshold);
    for (const p of low) {
      try {
        await notifyLowStockForProducts([p.id], owner.id, p.standId);
      } catch (error) {
        console.error("Low-stock notify after stock count failed", error);
      }
    }

    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/products");
    return { ok: true, changed: changed.length };
  } catch (error) {
    console.error("applyStockCount failed", error);
    return { error: error instanceof Error ? error.message : "Could not save count." };
  }
}

export async function setProductSupplyStatus(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const productId = String(formData.get("productId") ?? "");
    const raw = String(formData.get("supplyStatus") ?? "");
    if (!productId) return { error: "Missing product." };
    const supplyStatus = raw === "" ? null : isSupplyStatus(raw) ? raw : undefined;
    if (supplyStatus === undefined) return { error: "Unknown status." };

    const result = await prisma.product.updateMany({
      where: { id: productId, ownerId: owner.id },
      data: { supplyStatus },
    });
    if (result.count === 0) return { error: "Product not found." };

    revalidatePath(`/dashboard/products/${productId}`);
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/inventory");
    return { ok: true };
  } catch (error) {
    console.error("setProductSupplyStatus failed", error);
    return { error: error instanceof Error ? error.message : "Could not update status." };
  }
}
