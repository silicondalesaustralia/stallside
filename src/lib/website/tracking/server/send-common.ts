import { createHash } from "crypto";
import type { TrackItem } from "../events";
import type { TrackingAttribution } from "./attribution";

/** One purchase as the server sends it (real order or a test event). */
export type ServerPurchase = {
  eventId: string;
  orderNumber: string;
  eventTimeSec: number;
  valueCents: number;
  currency: string;
  items: TrackItem[];
  email?: string;
  phone?: string;
  attribution: TrackingAttribution;
};

export type SendResult = { ok: true; detail?: string } | { ok: false; error: string };

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

export function hashEmail(email: string | undefined): string | undefined {
  const clean = email?.trim().toLowerCase();
  return clean ? sha256(clean) : undefined;
}

/** E.164 digits without "+"; Australian local numbers (04…, 02…) get 61. */
export function hashPhone(phone: string | undefined): string | undefined {
  let digits = phone?.replace(/\D/g, "") ?? "";
  if (/^0\d{9}$/.test(digits)) digits = `61${digits.slice(1)}`;
  return digits.length >= 8 ? sha256(digits) : undefined;
}

const TIMEOUT_MS = 8000;

/** POST JSON and report the platform's error text on failure. */
export async function postJson(url: string, body: unknown, headers: Record<string, string> = {}): Promise<SendResult> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const text = await res.text();
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 300)}` };
    return { ok: true, detail: text.slice(0, 500) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Request failed" };
  }
}

export const centsToAmount = (cents: number) => Math.round(cents) / 100;
