import { createHmac, timingSafeEqual } from "crypto";
import { squareWebhookSignatureKey } from "@/lib/square/config";

/**
 * Verify Square webhook signature.
 * https://developer.squareup.com/docs/webhooks/step3validate
 */
export function verifySquareWebhookSignature(input: {
  body: string;
  signatureHeader: string | null;
  notificationUrl: string;
}): boolean {
  const key = squareWebhookSignatureKey();
  if (!key || !input.signatureHeader) return false;
  const payload = input.notificationUrl + input.body;
  const hmac = createHmac("sha256", key).update(payload).digest("base64");
  try {
    const a = Buffer.from(hmac);
    const b = Buffer.from(input.signatureHeader);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export type SquareWebhookEnvelope = {
  merchant_id?: string;
  type?: string;
  event_id?: string;
  data?: {
    type?: string;
    id?: string;
    object?: unknown;
  };
};
