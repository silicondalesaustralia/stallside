import type { BuiltImport } from "./build-rows";
import type { ImportIssue } from "./import-product";
import {
  finishImport,
  importCustomersChunk,
  importProductsChunk,
  importStockChunk,
  type ChunkResult,
} from "@/app/dashboard/(gated)/data/import/actions";

export type ImportTotals = { created: number; updated: number; skipped: number; issues: ImportIssue[] };

function sendChunk(built: BuiltImport, start: number, size: number, source: string, updateExisting: boolean): Promise<ChunkResult> {
  if (built.entity === "products") {
    return importProductsChunk({ source, updateExisting, items: built.items.slice(start, start + size) });
  }
  if (built.entity === "customers") {
    return importCustomersChunk({ source, items: built.items.slice(start, start + size) });
  }
  return importStockChunk({ items: built.items.slice(start, start + size) });
}

/** Sends the import in small batches so big files don't time out; reports progress 0–1. */
export async function runImport(
  built: BuiltImport,
  opts: { source: string; updateExisting: boolean; onProgress: (done: number) => void },
): Promise<ImportTotals> {
  const size = built.entity === "products" ? 10 : 200;
  const totals: ImportTotals = { created: 0, updated: 0, skipped: 0, issues: [] };
  const batches = Math.ceil(built.items.length / size);
  for (let n = 0; n < batches; n++) {
    try {
      const result = await sendChunk(built, n * size, size, opts.source, opts.updateExisting);
      if ("error" in result) {
        totals.issues.push({ ref: `Batch ${n + 1}`, message: result.error });
      } else {
        totals.created += result.created;
        totals.updated += result.updated;
        totals.skipped += result.skipped;
        totals.issues.push(...result.issues);
      }
    } catch (error) {
      console.error("Import batch failed", error);
      totals.issues.push({ ref: `Batch ${n + 1}`, message: "Lost connection. Re-run the import to finish; existing rows are matched, not duplicated." });
    }
    opts.onProgress((n + 1) / batches);
  }
  try {
    await finishImport();
  } catch (error) {
    console.error("Import refresh failed", error);
  }
  return totals;
}
