import { createHmac, timingSafeEqual } from "crypto";
import { cleanEnvSecret } from "@/lib/env";

const PICK_TOKEN_TTL_MS = 48 * 60 * 60 * 1000;

function secret(): string {
  const key = cleanEnvSecret(process.env.BLOG_PICK_SECRET) ?? cleanEnvSecret(process.env.BLOG_AGENT_TOKEN);
  if (!key) throw new Error("BLOG_PICK_SECRET or BLOG_AGENT_TOKEN must be set to sign pick links");
  return key;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(`blog-pick:${payload}`).digest("base64url");
}

/** Email link token: topic id + expiry, HMAC-signed so the pick page needs no login. */
export function createPickToken(topicId: string, now = Date.now()): string {
  const payload = `${topicId}.${now + PICK_TOKEN_TTL_MS}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyPickToken(token: string, now = Date.now()): { topicId: string } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [topicId, expires, signature] = parts;
  if (!topicId || !Number.isFinite(Number(expires)) || Number(expires) < now) return null;
  let expected: string;
  try {
    expected = sign(`${topicId}.${expires}`);
  } catch (error) {
    console.error("[blog] cannot verify pick token", error);
    return null;
  }
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b) ? { topicId } : null;
}
