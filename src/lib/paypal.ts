import { appBaseUrl } from "@/lib/app-url";

export { appBaseUrl };

type PayPalToken = { access_token: string; expires_at: number };

let cachedToken: PayPalToken | null = null;

export function isPayPalConfigured(): boolean {
  return Boolean(
    process.env.PAYPAL_CLIENT_ID &&
      process.env.PAYPAL_CLIENT_SECRET &&
      process.env.PAYPAL_PARTNER_MERCHANT_ID,
  );
}

export function isPayPalLiveMode(): boolean {
  return (process.env.PAYPAL_MODE || "sandbox").toLowerCase() === "live";
}

/** Owner Connect UI — off in live until PAYPAL_CONNECT_ENABLED=1. */
export function isPayPalConnectAvailable(): boolean {
  if (!isPayPalLiveMode()) return true;
  return process.env.PAYPAL_CONNECT_ENABLED === "1";
}

export function paypalApiBase(): string {
  const mode = (process.env.PAYPAL_MODE || "sandbox").toLowerCase();
  return mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export function paypalPartnerMerchantId(): string {
  const id = process.env.PAYPAL_PARTNER_MERCHANT_ID;
  if (!id) throw new Error("PAYPAL_PARTNER_MERCHANT_ID is not set");
  return id;
}

/** Same account as REST credentials — for direct (non-marketplace) checkout. */
export function paypalDirectMerchantId(): string | null {
  const id =
    process.env.PAYPAL_DIRECT_MERCHANT_ID?.trim() ||
    process.env.PAYPAL_PARTNER_MERCHANT_ID?.trim();
  return id || null;
}

/** True when Partner Referrals isn't available; use platform PayPal account. */
export function isPayPalDirectMode(): boolean {
  return (process.env.PAYPAL_CONNECT_MODE || "").toLowerCase() === "direct";
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) {
    throw new Error("PayPal credentials are not set");
  }

  if (cachedToken && cachedToken.expires_at > Date.now() + 30_000) {
    return cachedToken.access_token;
  }

  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const res = await fetch(`${paypalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PayPal token failed: ${res.status} ${body}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

export async function paypalFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  const bn = process.env.PAYPAL_BN_CODE;
  if (bn) headers.set("PayPal-Partner-Attribution-Id", bn);

  const res = await fetch(`${paypalApiBase()}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PayPal ${path} failed: ${res.status} ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
