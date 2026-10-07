"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireOwner, requireOwnerWrite } from "@/lib/session";
import { standCatalogTag } from "@/lib/stand-catalog-tag";
import { listImportCandidates } from "@/lib/square/catalog-import";
import { importSquareVariations } from "@/lib/square/catalog-import-run";

export type SquareImportRow = {
  variationId: string;
  name: string;
  priceCents: number | null;
  stock: number | null;
  sku: string | null;
  hasImage: boolean;
};

export async function loadSquareImportCandidates(): Promise<
  | { ok: true; rows: SquareImportRow[]; linked: number; matchesExisting: number }
  | { error: string }
> {
  try {
    const { owner } = await requireOwner();
    const res = await listImportCandidates(owner.id);
    if ("error" in res) return res;
    return {
      ok: true,
      linked: res.linked,
      matchesExisting: res.matchesExisting,
      rows: res.candidates.map((c) => ({
        variationId: c.variationId,
        name: c.name,
        priceCents: c.priceCents,
        stock: c.stock,
        sku: c.sku,
        hasImage: Boolean(c.imageUrl),
      })),
    };
  } catch (error) {
    console.error("Load Square import candidates failed", error);
    return {
      error: error instanceof Error ? `Square: ${error.message}` : "Could not load Square items.",
    };
  }
}

export async function importFromSquareAction(
  standId: string,
  variationIds: string[],
): Promise<{ ok: true; message: string } | { error: string }> {
  try {
    const { owner } = await requireOwnerWrite();
    if (variationIds.length === 0) return { error: "Pick at least one Square item." };
    const res = await importSquareVariations({ ownerId: owner.id, standId, variationIds });
    if ("error" in res) return res;

    revalidatePath("/dashboard/settings/square");
    revalidatePath("/dashboard/products");
    revalidatePath(`/s/${res.standSlug}`);
    revalidateTag(standCatalogTag(res.standSlug), "max");
    const imageNote = res.images > 0 ? ` with ${res.images} photo${res.images === 1 ? "" : "s"}` : "";
    return {
      ok: true,
      message: `Imported ${res.imported} product${res.imported === 1 ? "" : "s"} from Square${imageNote}.`,
    };
  } catch (error) {
    console.error("Import from Square failed", error);
    return {
      error: error instanceof Error ? `Import failed: ${error.message}` : "Could not import from Square.",
    };
  }
}
