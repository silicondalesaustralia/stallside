import { revalidatePath } from "next/cache";
import { applyStockCounts } from "@/lib/inventory/apply-stock-counts";
import { syncManualStockToSquare } from "@/lib/square/sync-stock";

/** Applies counted stock, pushes it to Square, and refreshes web views. Returns products changed. */
export async function saveStockCounts(input: {
  ownerId: string;
  counts: Map<string, number>;
  reason: string;
  standId?: string;
}): Promise<number> {
  const changed = await applyStockCounts(input);
  if (changed > 0) await syncManualStockToSquare(input.ownerId, [...input.counts.keys()]);

  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard");
  return changed;
}
