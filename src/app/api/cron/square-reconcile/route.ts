import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CommerceProvider } from "@/generated/prisma/client";
import { isSquareInventoryEnabled } from "@/lib/square/config";
import { getValidSquareAccessToken } from "@/lib/square/connection";
import { retrieveSquareInventoryCounts } from "@/lib/square/inventory-api";
import { applySquareInventoryCount } from "@/lib/square/apply-inventory";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/** Periodic Square ↔ Vendl inventory reconciliation. */
export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isSquareInventoryEnabled()) {
    return NextResponse.json({ skipped: true, reason: "flag_off" });
  }

  const connections = await prisma.externalCommerceConnection.findMany({
    where: {
      provider: CommerceProvider.SQUARE,
      inventorySyncEnabled: true,
      status: "ACTIVE",
      primaryLocationId: { not: null },
    },
    take: 50,
  });

  let repaired = 0;
  let checked = 0;

  for (const conn of connections) {
    const token = await getValidSquareAccessToken(conn.id);
    if (!token || !conn.primaryLocationId) continue;

    const mappings = await prisma.externalVariantMapping.findMany({
      where: {
        connectionId: conn.id,
        inventorySyncEnabled: true,
        confirmedAt: { not: null },
      },
      take: 100,
    });
    if (mappings.length === 0) continue;

    const ids = mappings.map((m) => m.providerVariationId);
    try {
      const result = await retrieveSquareInventoryCounts({
        accessToken: token,
        catalogObjectIds: ids,
        locationIds: [conn.primaryLocationId],
      });
      for (const count of result.counts ?? []) {
        if (
          !count.catalog_object_id ||
          !count.location_id ||
          count.quantity == null
        ) {
          continue;
        }
        checked += 1;
        const qty = Number.parseInt(count.quantity, 10);
        if (!Number.isFinite(qty)) continue;
        const eventId = `reconcile:${conn.id}:${count.catalog_object_id}:${count.calculated_at ?? Date.now()}`;
        const status = await applySquareInventoryCount({
          merchantId: conn.providerMerchantId,
          eventId,
          catalogObjectId: count.catalog_object_id,
          locationId: count.location_id,
          quantity: qty,
        });
        if (status === "applied") repaired += 1;
      }
    } catch (error) {
      console.error("Square reconcile failed", conn.id, error);
      await prisma.externalCommerceConnection.update({
        where: { id: conn.id },
        data: {
          lastError:
            error instanceof Error
              ? error.message.slice(0, 500)
              : "reconcile failed",
        },
      });
    }
  }

  return NextResponse.json({ ok: true, checked, repaired });
}
