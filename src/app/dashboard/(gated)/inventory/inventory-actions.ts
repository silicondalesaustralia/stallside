"use server";

import { revalidatePath } from "next/cache";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { isSupplyStatus } from "@/lib/inventory/inventory-status";
import { applyStockCounts } from "@/lib/inventory/apply-stock-counts";
import { syncManualStockToSquare } from "@/lib/square/sync-stock";

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

    const changed = await applyStockCounts({ ownerId: owner.id, counts, reason: "Stock count" });
    if (changed > 0) await syncManualStockToSquare(owner.id, [...counts.keys()]);

    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/products");
    return { ok: true, changed };
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
