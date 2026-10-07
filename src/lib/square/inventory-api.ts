import { squareFetch } from "@/lib/square/client";

/** Adjust Square inventory without creating a Square Order (avoids 1% Orders fee). */
export async function batchChangeSquareInventory(input: {
  accessToken: string;
  idempotencyKey: string;
  changes: Array<{
    catalogObjectId: string;
    locationId: string;
    quantity: string;
    fromState: "IN_STOCK" | "NONE";
    toState: "IN_STOCK" | "SOLD" | "NONE";
  }>;
}) {
  return squareFetch<{
    counts?: Array<{
      catalog_object_id?: string;
      location_id?: string;
      quantity?: string;
    }>;
  }>("/v2/inventory/batch-change", {
    accessToken: input.accessToken,
    method: "POST",
    body: {
      idempotency_key: input.idempotencyKey,
      changes: input.changes.map((c) => ({
        type: "ADJUSTMENT",
        adjustment: {
          catalog_object_id: c.catalogObjectId,
          location_id: c.locationId,
          quantity: c.quantity,
          from_state: c.fromState,
          to_state: c.toState,
          occurred_at: new Date().toISOString(),
        },
      })),
    },
    idempotencyKey: input.idempotencyKey,
  });
}

/** Set absolute on-hand counts (max 100 changes per Square request). */
export async function setSquarePhysicalCounts(input: {
  accessToken: string;
  idempotencyKey: string;
  counts: Array<{ catalogObjectId: string; locationId: string; quantity: number }>;
}) {
  const occurredAt = new Date().toISOString();
  for (let i = 0; i < input.counts.length; i += 100) {
    const chunk = input.counts.slice(i, i + 100);
    const key = `${input.idempotencyKey}:${i}`;
    await squareFetch("/v2/inventory/batch-change", {
      accessToken: input.accessToken,
      method: "POST",
      body: {
        idempotency_key: key,
        changes: chunk.map((c) => ({
          type: "PHYSICAL_COUNT",
          physical_count: {
            catalog_object_id: c.catalogObjectId,
            location_id: c.locationId,
            quantity: String(Math.max(0, Math.floor(c.quantity))),
            state: "IN_STOCK",
            occurred_at: occurredAt,
          },
        })),
      },
      idempotencyKey: key,
    });
  }
}

export async function retrieveSquareInventoryCounts(input: {
  accessToken: string;
  catalogObjectIds: string[];
  locationIds: string[];
}) {
  return squareFetch<{
    counts?: Array<{
      catalog_object_id?: string;
      location_id?: string;
      quantity?: string;
      calculated_at?: string;
    }>;
  }>("/v2/inventory/counts/batch-retrieve", {
    accessToken: input.accessToken,
    method: "POST",
    body: {
      catalog_object_ids: input.catalogObjectIds,
      location_ids: input.locationIds,
      states: ["IN_STOCK"],
    },
  });
}
