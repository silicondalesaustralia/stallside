import { prisma } from "@/lib/prisma";
import { getSquareConnection, getValidSquareAccessToken } from "@/lib/square/connection";
import {
  listSquareVariationRows,
  type SquareVariationRow,
} from "@/lib/square/catalog-import-api";
import { retrieveSquareInventoryCounts } from "@/lib/square/inventory-api";

export type ImportCandidate = SquareVariationRow & { stock: number | null };

type Ready = {
  conn: NonNullable<Awaited<ReturnType<typeof getSquareConnection>>>;
  token: string;
};

export async function readySquareCatalog(ownerId: string): Promise<Ready | { error: string }> {
  const conn = await getSquareConnection(ownerId);
  if (!conn || conn.status !== "ACTIVE") return { error: "Connect Square first." };
  if (!conn.catalogSyncEnabled) return { error: "Turn on product / catalogue sync first." };
  const token = await getValidSquareAccessToken(conn.id);
  if (!token) return { error: "Reconnect Square, then try again." };
  return { conn, token };
}

const norm = (s: string | null | undefined) => (s ?? "").trim().toLowerCase();

/** Square variations that are neither linked nor an exact match for an existing Vendl product. */
export async function listImportCandidates(ownerId: string): Promise<
  { candidates: ImportCandidate[]; linked: number; matchesExisting: number } | { error: string }
> {
  const ready = await readySquareCatalog(ownerId);
  if ("error" in ready) return ready;
  const { conn, token } = ready;

  const [rows, mappings, products] = await Promise.all([
    listSquareVariationRows(token),
    prisma.externalVariantMapping.findMany({
      where: { connectionId: conn.id },
      select: { providerVariationId: true },
    }),
    prisma.product.findMany({
      where: { ownerId, isArchived: false },
      select: { name: true, sku: true, upc: true },
    }),
  ]);

  const linkedIds = new Set(mappings.map((m) => m.providerVariationId));
  const names = new Set(products.map((p) => norm(p.name)));
  const skus = new Set(products.map((p) => norm(p.sku)).filter(Boolean));
  const upcs = new Set(products.map((p) => norm(p.upc)).filter(Boolean));

  const unlinked = rows.filter((r) => !linkedIds.has(r.variationId));
  const fresh = unlinked.filter(
    (r) =>
      !names.has(norm(r.name)) &&
      !(r.sku && skus.has(norm(r.sku))) &&
      !(r.upc && upcs.has(norm(r.upc))),
  );

  const stock = await stockByVariation(token, conn.primaryLocationId, fresh);
  return {
    candidates: fresh.map((r) => ({ ...r, stock: stock.get(r.variationId) ?? null })),
    linked: rows.length - unlinked.length,
    matchesExisting: unlinked.length - fresh.length,
  };
}

async function stockByVariation(
  token: string,
  locationId: string | null,
  rows: SquareVariationRow[],
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  if (!locationId || rows.length === 0) return out;
  const ids = rows.map((r) => r.variationId);
  for (let i = 0; i < ids.length; i += 100) {
    const res = await retrieveSquareInventoryCounts({
      accessToken: token,
      catalogObjectIds: ids.slice(i, i + 100),
      locationIds: [locationId],
    });
    for (const c of res.counts ?? []) {
      if (!c.catalog_object_id || c.quantity == null) continue;
      const qty = Number.parseFloat(c.quantity);
      if (Number.isFinite(qty)) out.set(c.catalog_object_id, Math.max(0, Math.floor(qty)));
    }
  }
  return out;
}
