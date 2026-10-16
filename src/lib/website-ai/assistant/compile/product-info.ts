import { INFO_ROW_TEXT_MAX, INFO_ROWS_MAX, type InfoRow, type ProductLayout } from "@/lib/studio/product-detail-settings";
import type { AssistantContext } from "../context/types";

const clip = (s: string) => s.trim().slice(0, INFO_ROW_TEXT_MAX);

function locality(ctx: AssistantContext): string | null {
  return ctx.searchProfile.locality?.trim() || ctx.stand.locality?.trim() || null;
}

function handoverRow(ctx: AssistantContext): InfoRow | null {
  const f = new Set(ctx.catalogue.fulfilments);
  const pickup = f.has("PICKUP") || f.has("BOTH") || (f.size === 0 && ctx.features.pickup);
  const delivery = f.has("DELIVERY") || f.has("BOTH") || (f.size === 0 && ctx.features.delivery);
  if (pickup && delivery) return { id: "ai-row-handover", icon: "delivery", text: "Pickup or delivery — choose at checkout" };
  if (pickup) return { id: "ai-row-handover", icon: "pickup", text: "Pickup only" };
  if (delivery) return { id: "ai-row-handover", icon: "delivery", text: "Delivery available" };
  return null;
}

/** Product page info rows built only from confirmed facts (fulfilment, freshness notes, location, payments). */
export function productInfoRows(ctx: AssistantContext): InfoRow[] {
  const rows: InfoRow[] = [];
  const handover = handoverRow(ctx);
  if (handover) rows.push(handover);
  const fresh = ctx.catalogue.freshnessNotes[0];
  if (fresh) rows.push({ id: "ai-row-fresh", icon: "fresh", text: clip(fresh) });
  const place = locality(ctx);
  if (place) rows.push({ id: "ai-row-local", icon: "local", text: clip(`Local to ${place}`) });
  if (ctx.features.cardPayments) rows.push({ id: "ai-row-secure", icon: "secure", text: "Secure checkout" });
  return rows.slice(0, INFO_ROWS_MAX);
}

/** Photo-led layout when most products have a photo; otherwise the compact classic layout. */
export function productLayoutFor(ctx: AssistantContext): ProductLayout {
  const { productCount, productPhotoCount } = ctx.catalogue;
  return productCount > 0 && productPhotoCount / productCount >= 0.6 ? "featured" : "classic";
}
