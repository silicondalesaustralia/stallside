import { randomInt } from "crypto";
import { centsToAmount, postJson, type SendResult, type ServerPurchase } from "./send-common";

/** GA needs a client_id; without the _ga cookie we make a one-off one (no session stitching). */
function fallbackClientId(): string {
  return `${randomInt(1_000_000_000, 2_000_000_000)}.${Math.floor(Date.now() / 1000)}`;
}

/**
 * GA4 Measurement Protocol purchase. GA de-duplicates on transaction_id, so the browser
 * and server events for one order count once. `validate` uses the debug endpoint.
 */
export async function sendGa4Purchase(input: {
  measurementId: string;
  apiSecret: string;
  purchase: ServerPurchase;
  validate?: boolean;
}): Promise<SendResult> {
  const { purchase: p } = input;
  const body = {
    client_id: p.attribution.gaClientId ?? fallbackClientId(),
    timestamp_micros: p.eventTimeSec * 1_000_000,
    events: [
      {
        name: "purchase",
        params: {
          transaction_id: p.orderNumber,
          currency: p.currency,
          value: centsToAmount(p.valueCents),
          items: p.items.map((i) => ({
            item_id: i.id,
            item_name: i.name,
            price: centsToAmount(i.priceCents),
            quantity: i.quantity,
          })),
        },
      },
    ],
  };
  const host = input.validate ? "https://www.google-analytics.com/debug/mp/collect" : "https://www.google-analytics.com/mp/collect";
  const url = `${host}?measurement_id=${encodeURIComponent(input.measurementId)}&api_secret=${encodeURIComponent(input.apiSecret)}`;
  const result = await postJson(url, body);
  if (!result.ok || !input.validate) return result;
  try {
    const parsed: unknown = JSON.parse(result.detail ?? "{}");
    const messages = parsed && typeof parsed === "object" ? (parsed as { validationMessages?: { description?: string }[] }).validationMessages : undefined;
    if (messages && messages.length > 0) return { ok: false, error: messages.map((m) => m.description ?? "").join("; ") };
  } catch {
    return { ok: false, error: "GA4 returned an unreadable validation response." };
  }
  return { ok: true, detail: "GA4 accepted the event format. Note: GA4 doesn't validate the API secret here." };
}
