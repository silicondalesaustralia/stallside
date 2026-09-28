"use server";

import { revalidatePath } from "next/cache";
import { requireOwnerWrite } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { applyStockCounts } from "@/lib/inventory/apply-stock-counts";
import { planStockImport, type ImportLine } from "@/lib/inventory/stock-import";

export type ImportPreviewResult =
  | { ok: true; lines: ImportLine[]; changes: number; unchanged: number; issues: number }
  | { error: string };

type Planned =
  | { ownerId: string; standId: string; result: Awaited<ReturnType<typeof planStockImport>> }
  | { error: string };

async function plan(csv: string): Promise<Planned> {
  const { owner } = await requireOwnerWrite();
  const { selected } = await resolveSelectedBusiness(owner.id);
  if (!selected) return { error: "Select a business first." };
  const result = await planStockImport({ ownerId: owner.id, standId: selected.id, csv });
  return { ownerId: owner.id, standId: selected.id, result };
}

export async function previewStockImport(csv: string): Promise<ImportPreviewResult> {
  try {
    const planned = await plan(csv);
    if ("error" in planned) return planned;
    const { result } = planned;
    if ("error" in result) return result;
    const changedFirst = [...result.lines].sort(
      (a, b) => Number(Boolean(b.issue)) - Number(Boolean(a.issue)) ||
        Number(b.next !== b.current) - Number(a.next !== a.current),
    );
    return { ok: true, lines: changedFirst, changes: result.changes, unchanged: result.unchanged, issues: result.issues };
  } catch (error) {
    console.error("previewStockImport failed", error);
    return { error: error instanceof Error ? error.message : "Could not read the file." };
  }
}

export async function applyStockImport(csv: string): Promise<{ ok: true; changed: number } | { error: string }> {
  try {
    const planned = await plan(csv);
    if ("error" in planned) return planned;
    const { ownerId, standId, result } = planned;
    if ("error" in result) return result;
    if (result.counts.size === 0) return { error: "Nothing to import." };
    const changed = await applyStockCounts({
      ownerId,
      standId,
      counts: result.counts,
      reason: "CSV import",
    });
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/products");
    return { ok: true, changed };
  } catch (error) {
    console.error("applyStockImport failed", error);
    return { error: error instanceof Error ? error.message : "Could not import stock." };
  }
}
