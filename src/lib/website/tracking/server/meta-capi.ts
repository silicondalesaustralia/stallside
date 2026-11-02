import { centsToAmount, hashEmail, hashPhone, postJson, type SendResult, type ServerPurchase } from "./send-common";

const GRAPH_VERSION = "v21.0";

/** Meta Conversions API Purchase; event_id matches the browser pixel so Meta counts it once. */
export async function sendMetaPurchase(input: {
  pixelId: string;
  accessToken: string;
  testEventCode?: string;
  purchase: ServerPurchase;
}): Promise<SendResult> {
  const { purchase: p } = input;
  const a = p.attribution;
  const em = hashEmail(p.email);
  const ph = hashPhone(p.phone);
  const body = {
    data: [
      {
        event_name: "Purchase",
        event_time: p.eventTimeSec,
        event_id: p.eventId,
        action_source: "website",
        ...(a.pageUrl ? { event_source_url: a.pageUrl } : {}),
        user_data: {
          ...(em ? { em: [em] } : {}),
          ...(ph ? { ph: [ph] } : {}),
          ...(a.fbp ? { fbp: a.fbp } : {}),
          ...(a.fbc ? { fbc: a.fbc } : {}),
          ...(a.ip ? { client_ip_address: a.ip } : {}),
          ...(a.userAgent ? { client_user_agent: a.userAgent } : {}),
        },
        custom_data: {
          currency: p.currency,
          value: centsToAmount(p.valueCents),
          order_id: p.orderNumber,
          content_type: "product",
          content_ids: p.items.map((i) => i.id),
          contents: p.items.map((i) => ({ id: i.id, quantity: i.quantity, item_price: centsToAmount(i.priceCents) })),
          num_items: p.items.reduce((sum, i) => sum + i.quantity, 0),
        },
      },
    ],
    ...(input.testEventCode ? { test_event_code: input.testEventCode } : {}),
  };
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(input.pixelId)}/events?access_token=${encodeURIComponent(input.accessToken)}`;
  return postJson(url, body);
}
