import { createHmac, timingSafeEqual } from "node:crypto";
import { cleanEnvSecret } from "@/lib/env";

type CalendarOAuthState = { ownerId: string; issuedAt: number };

const STATE_MAX_AGE_MS = 15 * 60 * 1000;

function sign(payload: string): string {
  const secret = cleanEnvSecret(process.env.AUTH_SECRET);
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return createHmac("sha256", `calendar-oauth:${secret}`).update(payload).digest("base64url");
}

export function encodeCalendarOAuthState(ownerId: string): string {
  const payload = Buffer.from(JSON.stringify({ ownerId, issuedAt: Date.now() })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/** Null when the signature is wrong, the payload is malformed, or it is older than 15 minutes. */
export function decodeCalendarOAuthState(raw: string | null): CalendarOAuthState | null {
  if (!raw) return null;
  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as Partial<CalendarOAuthState>;
    if (typeof parsed.ownerId !== "string" || typeof parsed.issuedAt !== "number") return null;
    if (Date.now() - parsed.issuedAt > STATE_MAX_AGE_MS) return null;
    return { ownerId: parsed.ownerId, issuedAt: parsed.issuedAt };
  } catch {
    return null;
  }
}
