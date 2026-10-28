"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { loadSelectedDataContext } from "@/lib/data-transfer/selected-context";
import { standCatalogTag } from "@/lib/stand-catalog-tag";
import {
  importCustomerSchema,
  importProductSchema,
  importStockSchema,
  type ImportIssue,
} from "@/lib/data-import/import-product";
import { applyImportProduct } from "@/lib/data-import/apply/apply-product";
import { applyImportCustomer } from "@/lib/data-import/apply/apply-customer";
import { applyImportStock } from "@/lib/data-import/apply/apply-stock";

export type ChunkResult =
  | { created: number; updated: number; skipped: number; issues: ImportIssue[] }
  | { error: string };

const sourceSchema = z.string().trim().min(1).max(40);
const productsInput = z.object({
  source: sourceSchema,
  updateExisting: z.boolean(),
  items: z.array(importProductSchema).max(25),
});
const customersInput = z.object({ source: sourceSchema, items: z.array(importCustomerSchema).max(500) });
const stockInput = z.object({ items: z.array(importStockSchema).max(500) });

type Outcome = "created" | "updated" | "skipped" | { error: string };

async function runChunk<T>(
  items: T[],
  refOf: (item: T) => string,
  apply: (item: T) => Promise<Outcome>,
): Promise<ChunkResult> {
  const result = { created: 0, updated: 0, skipped: 0, issues: [] as ImportIssue[] };
  for (const item of items) {
    try {
      const outcome = await apply(item);
      if (typeof outcome === "string") result[outcome] += 1;
      else result.issues.push({ ref: refOf(item), message: outcome.error });
    } catch (error) {
      console.error("Import row failed", error);
      result.issues.push({ ref: refOf(item), message: "Could not import this row." });
    }
  }
  return result;
}

export async function importProductsChunk(raw: unknown): Promise<ChunkResult> {
  const parsed = productsInput.safeParse(raw);
  if (!parsed.success) return { error: "Some rows are not valid. Check the mapping and try again." };
  const ctx = await loadSelectedDataContext();
  if (!ctx) return { error: "Choose a business first." };
  const { source, updateExisting, items } = parsed.data;
  const importCtx = { ownerId: ctx.ownerId, stand: ctx.stand, source, updateExisting };
  return runChunk(items, (i) => i.ref, (item) => applyImportProduct(importCtx, item));
}

export async function importCustomersChunk(raw: unknown): Promise<ChunkResult> {
  const parsed = customersInput.safeParse(raw);
  if (!parsed.success) return { error: "Some rows are not valid. Check the mapping and try again." };
  const ctx = await loadSelectedDataContext();
  if (!ctx) return { error: "Choose a business first." };
  const { source, items } = parsed.data;
  return runChunk(items, (i) => i.email, (item) => applyImportCustomer(ctx.ownerId, source, item));
}

export async function importStockChunk(raw: unknown): Promise<ChunkResult> {
  const parsed = stockInput.safeParse(raw);
  if (!parsed.success) return { error: "Some rows are not valid. Check the mapping and try again." };
  const ctx = await loadSelectedDataContext();
  if (!ctx) return { error: "Choose a business first." };
  return runChunk(parsed.data.items, (i) => i.ref, (item) =>
    applyImportStock(ctx.ownerId, ctx.stand.id, item),
  );
}

export async function finishImport(): Promise<void> {
  const ctx = await loadSelectedDataContext();
  if (!ctx) return;
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/customers");
  revalidatePath(`/s/${ctx.stand.slug}`);
  revalidateTag(standCatalogTag(ctx.stand.slug), "max");
}
