"use server";

import { revalidatePath } from "next/cache";
import { loadSelectedDataContext } from "@/lib/data-transfer/selected-context";
import { readUpload } from "@/lib/data-transfer/read-upload";
import { DATA_SECTIONS } from "@/lib/data-transfer/registry";
import type { ApplyState, PreviewState, SectionPreview } from "./import-types";

/** Sections that link to products can't be checked until new products exist. */
const NEEDS_PRODUCTS = new Set(["preorders", "subscriptions"]);

export async function previewImport(_prev: PreviewState | null, formData: FormData): Promise<PreviewState> {
  try {
    const ctx = await loadSelectedDataContext();
    if (!ctx) return { ok: false, error: "Select a business first." };
    const upload = await readUpload(formData.get("file") as File | null, String(formData.get("section") ?? ""));
    if ("error" in upload) return { ok: false, error: upload.error };
    let newProducts = false;
    const sections: SectionPreview[] = [];
    for (const s of upload.sections) {
      if (newProducts && NEEDS_PRODUCTS.has(s.section)) {
        sections.push({ section: s.section, fileName: s.fileName, rowCount: s.rows.length, preview: null });
        continue;
      }
      const run = DATA_SECTIONS[s.section].preview;
      if (!run) continue;
      const preview = await run(s.rows, ctx);
      if (s.section === "products" && preview.creates.length) newProducts = true;
      sections.push({ section: s.section, fileName: s.fileName, rowCount: s.rows.length, preview });
    }
    return { ok: true, sections, skipped: upload.skipped };
  } catch (error) {
    console.error("Import preview failed", error);
    return { ok: false, error: "Could not read that file. Check it's a CSV saved from a spreadsheet." };
  }
}

export async function applyImport(_prev: ApplyState | null, formData: FormData): Promise<ApplyState> {
  const results: Extract<ApplyState, { ok: true }>["results"] = [];
  try {
    const ctx = await loadSelectedDataContext();
    if (!ctx) return { ok: false, error: "Select a business first." };
    const upload = await readUpload(formData.get("file") as File | null, String(formData.get("section") ?? ""));
    if ("error" in upload) return { ok: false, error: upload.error };
    for (const s of upload.sections) {
      try {
        const run = DATA_SECTIONS[s.section].apply;
        if (!run) continue;
        const outcome = await run(s.rows, ctx);
        results.push({ section: s.section, fileName: s.fileName, ...outcome });
      } catch (error) {
        console.error("Import section failed", s.section, error);
        const message = error instanceof Error ? error.message : "unexpected error";
        return { ok: true, results, stoppedAt: `${s.fileName}: ${message}` };
      }
    }
    return { ok: true, results };
  } catch (error) {
    console.error("Import failed", error);
    return { ok: false, error: "The import failed. Nothing after the last finished file was saved." };
  } finally {
    for (const path of ["/dashboard/products", "/dashboard/pre-order-pages", "/dashboard/subscriptions", "/dashboard/customers", "/dashboard/data"]) {
      revalidatePath(path);
    }
  }
}
