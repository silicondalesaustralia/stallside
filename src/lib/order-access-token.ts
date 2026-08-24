import crypto from "node:crypto";
import { appBaseUrl } from "@/lib/app-url";

export type OrderAccessPurpose = "cancel" | "balance";

function signingSecret() {
  return process.env.AUTH_SECRET ?? "dev";
}

/** Capability token for shopper order actions (HMAC; not stored in DB). */
export function orderAccessToken(
  orderId: string,
  purpose: OrderAccessPurpose,
): string {
  return crypto
    .createHmac("sha256", signingSecret())
    .update(`${purpose}:${orderId}`)
    .digest("base64url");
}

export function verifyOrderAccessToken(
  orderId: string,
  purpose: OrderAccessPurpose,
  token: string | null | undefined,
): boolean {
  if (!token) return false;
  const expected = orderAccessToken(orderId, purpose);
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function checkoutCancelledUrl(orderId: string): string {
  const token = orderAccessToken(orderId, "cancel");
  return `${appBaseUrl()}/checkout/cancelled?order=${encodeURIComponent(orderId)}&token=${encodeURIComponent(token)}`;
}

export function balanceAuthUrl(orderId: string): string {
  const token = orderAccessToken(orderId, "balance");
  return `${appBaseUrl()}/checkout/balance/${encodeURIComponent(orderId)}?token=${encodeURIComponent(token)}`;
}
