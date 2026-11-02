import { centsToAmount, hashEmail, hashPhone, postJson, type SendResult, type ServerPurchase } from "./send-common";

const ENDPOINT = "https://business-api.tiktok.com/open_api/v1.3/event/track/";

/** TikTok Events API CompletePayment; event_id matches the browser pixel for de-duplication. */
export async function sendTikTokPurchase(input: {
  pixelId: string;
  accessToken: string;
  testEventCode?: string;
  purchase: ServerPurchase;
}): Promise<SendResult> {
  const { purchase: p } = input;
  const a = p.attribution;
  const email = hashEmail(p.email);
  const phone = hashPhone(p.phone);
  const body = {
    event_source: "web",
    event_source_id: input.pixelId,
    ...(input.testEventCode ? { test_event_code: input.testEventCode } : {}),
    data: [
      {
        event: "CompletePayment",
        event_time: p.eventTimeSec,
        event_id: p.eventId,
        user: {
          ...(email ? { email } : {}),
          ...(phone ? { phone } : {}),
          ...(a.ttp ? { ttp: a.ttp } : {}),
          ...(a.ttclid ? { ttclid: a.ttclid } : {}),
          ...(a.ip ? { ip: a.ip } : {}),
          ...(a.userAgent ? { user_agent: a.userAgent } : {}),
        },
        ...(a.pageUrl ? { page: { url: a.pageUrl } } : {}),
        properties: {
          currency: p.currency,
          value: centsToAmount(p.valueCents),
          order_id: p.orderNumber,
          content_type: "product",
          contents: p.items.map((i) => ({
            content_id: i.id,
            content_name: i.name,
            quantity: i.quantity,
            price: centsToAmount(i.priceCents),
          })),
        },
      },
    ],
  };
  const result = await postJson(ENDPOINT, body, { "Access-Token": input.accessToken });
  if (!result.ok) return result;
  try {
    const parsed: unknown = JSON.parse(result.detail ?? "{}");
    const code = parsed && typeof parsed === "object" ? (parsed as { code?: unknown; message?: unknown }) : {};
    if (code.code !== 0) return { ok: false, error: `TikTok: ${String(code.message ?? "unknown error")}` };
  } catch {
    return { ok: false, error: "TikTok returned an unreadable response." };
  }
  return result;
}
