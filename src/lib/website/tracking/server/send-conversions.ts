import { prisma } from "@/lib/prisma";
import { extractStorefrontTracking } from "../config";
import { ownerCanUseTagsPixels } from "../entitlements";
import { purchaseEventId } from "../events";
import { readTrackingSecrets, type TrackingSecrets } from "../secrets";
import type { TrackingIds } from "../types";
import { parseTrackingAttribution } from "./attribution";
import { sendGa4Purchase } from "./ga4-mp";
import { sendMetaPurchase } from "./meta-capi";
import { loadPaidPurchaseOrder, purchaseItems } from "./order-purchase";
import type { SendResult, ServerPurchase } from "./send-common";
import { sendTikTokPurchase } from "./tiktok-events";

export type ServerProvider = "meta" | "tiktok" | "ga4";

/** Sends one purchase to every provider that has both an id and a server credential. */
export function sendPurchaseToProviders(
  ids: TrackingIds,
  secrets: TrackingSecrets,
  purchase: ServerPurchase,
  /** test: send with the saved test codes (Meta/TikTok) and GA4's validation endpoint. Never for real orders. */
  options: { only?: ServerProvider; test?: boolean } = {},
): Promise<{ provider: ServerProvider; result: SendResult }>[] {
  const tasks: Promise<{ provider: ServerProvider; result: SendResult }>[] = [];
  const want = (p: ServerProvider) => !options.only || options.only === p;
  const metaTest = options.test ? secrets.metaTestEventCode : undefined;
  const tiktokTest = options.test ? secrets.tiktokTestEventCode : undefined;
  if (want("meta") && ids.metaPixelId && secrets.metaCapiToken) {
    tasks.push(sendMetaPurchase({ pixelId: ids.metaPixelId, accessToken: secrets.metaCapiToken, testEventCode: metaTest, purchase }).then((result) => ({ provider: "meta" as const, result })));
  }
  if (want("tiktok") && ids.tiktokPixelId && secrets.tiktokAccessToken) {
    tasks.push(sendTikTokPurchase({ pixelId: ids.tiktokPixelId, accessToken: secrets.tiktokAccessToken, testEventCode: tiktokTest, purchase }).then((result) => ({ provider: "tiktok" as const, result })));
  }
  if (want("ga4") && ids.ga4Id && secrets.ga4ApiSecret) {
    tasks.push(sendGa4Purchase({ measurementId: ids.ga4Id, apiSecret: secrets.ga4ApiSecret, purchase, validate: options.test }).then((result) => ({ provider: "ga4" as const, result })));
  }
  return tasks;
}

/**
 * Server-side purchase conversions for a paid website order (called after fulfilment).
 * Skips orders not placed on the seller's own host and visitors who declined consent.
 */
export async function sendServerConversions(orderId: string): Promise<void> {
  const order = await loadPaidPurchaseOrder({ id: orderId });
  if (!order) return;
  const attribution = parseTrackingAttribution(order.trackingAttribution);
  if (!attribution || attribution.consent !== "allowed") return;

  const storefront = await prisma.storefront.findUnique({
    where: { ownerId: order.ownerId },
    select: { publishedConfig: true, trackingSecrets: true },
  });
  if (!storefront?.trackingSecrets) return;
  if (!(await ownerCanUseTagsPixels(order.ownerId))) return;
  const { ids } = extractStorefrontTracking(storefront.publishedConfig);
  const secrets = readTrackingSecrets(storefront.trackingSecrets);

  const purchase: ServerPurchase = {
    eventId: purchaseEventId(order.orderNumber),
    orderNumber: order.orderNumber,
    eventTimeSec: Math.floor(Date.now() / 1000),
    valueCents: order.totalCents,
    currency: order.currency,
    items: purchaseItems(order),
    email: order.receiptEmail ?? undefined,
    phone: order.customerPhone ?? undefined,
    attribution,
  };
  const results = await Promise.allSettled(sendPurchaseToProviders(ids, secrets, purchase));
  for (const settled of results) {
    if (settled.status === "rejected") {
      console.error("Server conversion failed", orderId, settled.reason);
    } else if (!settled.value.result.ok) {
      console.error(`Server conversion (${settled.value.provider}) failed`, orderId, settled.value.result.error);
    }
  }
}
