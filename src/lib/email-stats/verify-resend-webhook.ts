import { createHmac, timingSafeEqual } from "node:crypto";
import { cleanEnvSecret } from "@/lib/env";

const TOLERANCE_SECONDS = 5 * 60;

export type ResendWebhookHeaders = {
  id: string | null;
  timestamp: string | null;
  signature: string | null;
};

function signingKey(secret: string): Buffer {
  return Buffer.from(secret.replace(/^whsec_/, ""), "base64");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** Resend signs webhooks with Svix: HMAC-SHA256 over `id.timestamp.body`. */
export function verifyResendWebhook(
  body: string,
  headers: ResendWebhookHeaders,
): boolean {
  const secret = cleanEnvSecret(process.env.RESEND_WEBHOOK_SECRET);
  const { id, timestamp, signature } = headers;
  if (!secret || !id || !timestamp || !signature) return false;

  const sentAt = Number(timestamp);
  if (!Number.isFinite(sentAt)) return false;
  if (Math.abs(Date.now() / 1000 - sentAt) > TOLERANCE_SECONDS) return false;

  const expected = createHmac("sha256", signingKey(secret))
    .update(`${id}.${timestamp}.${body}`)
    .digest("base64");

  return signature
    .split(" ")
    .map((part) => part.split(",")[1] ?? "")
    .some((candidate) => safeEqual(candidate, expected));
}
