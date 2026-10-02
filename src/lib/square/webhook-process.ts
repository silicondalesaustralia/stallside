import { prisma } from "@/lib/prisma";
import { CommerceProvider } from "@/generated/prisma/client";
import type { SquareWebhookEnvelope } from "@/lib/square/webhook-verify";
import { applySquareInventoryCount } from "@/lib/square/apply-inventory";

export async function persistSquareWebhookReceipt(
  envelope: SquareWebhookEnvelope,
  raw: unknown,
) {
  const eventId = envelope.event_id;
  if (!eventId) return { id: null as string | null, duplicate: true };

  const existing = await prisma.squareWebhookReceipt.findUnique({
    where: { eventId },
  });
  if (existing) return { id: existing.id, duplicate: true };

  const conn = envelope.merchant_id
    ? await prisma.externalCommerceConnection.findFirst({
        where: {
          provider: CommerceProvider.SQUARE,
          providerMerchantId: envelope.merchant_id,
        },
        select: { id: true },
      })
    : null;

  const receipt = await prisma.squareWebhookReceipt.create({
    data: {
      eventId,
      eventType: envelope.type ?? "unknown",
      merchantId: envelope.merchant_id ?? null,
      connectionId: conn?.id ?? null,
      payload: raw as object,
    },
  });
  return { id: receipt.id, duplicate: false };
}

export async function processSquareWebhookReceipt(receiptId: string) {
  const receipt = await prisma.squareWebhookReceipt.findUnique({
    where: { id: receiptId },
  });
  if (!receipt || receipt.processedAt) return;

  try {
    const envelope = receipt.payload as SquareWebhookEnvelope;
    if (receipt.eventType === "inventory.count.updated") {
      await processInventoryCountUpdated(envelope);
    }
    // payment/refund/catalog handled as needed; inventory is primary v1 signal
    await prisma.squareWebhookReceipt.update({
      where: { id: receiptId },
      data: { processedAt: new Date(), processError: null },
    });
  } catch (error) {
    await prisma.squareWebhookReceipt.update({
      where: { id: receiptId },
      data: {
        processError:
          error instanceof Error ? error.message.slice(0, 500) : "process failed",
      },
    });
  }
}

async function processInventoryCountUpdated(envelope: SquareWebhookEnvelope) {
  const obj = envelope.data?.object as
    | {
        inventory_counts?: Array<{
          catalog_object_id?: string;
          location_id?: string;
          quantity?: string;
        }>;
      }
    | undefined;
  const counts = obj?.inventory_counts ?? [];
  const merchantId = envelope.merchant_id;
  const eventId = envelope.event_id;
  if (!merchantId || !eventId) return;

  for (let i = 0; i < counts.length; i++) {
    const c = counts[i];
    if (!c.catalog_object_id || !c.location_id || c.quantity == null) continue;
    const qty = Number.parseInt(c.quantity, 10);
    if (!Number.isFinite(qty)) continue;
    await applySquareInventoryCount({
      merchantId,
      eventId: counts.length === 1 ? eventId : `${eventId}:${i}`,
      catalogObjectId: c.catalog_object_id,
      locationId: c.location_id,
      quantity: qty,
    });
  }
}
