import { appBaseUrl } from "@/lib/app-url";

export { appBaseUrl };

import { paypalAuthAssertion } from "@/lib/paypal-auth-assertion";

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

/**
 * Owner Connect UI + checkout. Off everywhere until PAYPAL_CONNECT_ENABLED=1
 * (sandbox included), so local/dev shows Coming soon by default.
 */
export function isPayPalConnectAvailable(): boolean {
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

/** Same account as REST credentials - for direct (non-marketplace) checkout. */
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

/** Marketplace Connect (seller payee + platform fees), not direct test. */
export function isPayPalMarketplaceMode(): boolean {
  return isPayPalConnectAvailable() && !isPayPalDirectMode();
}

/** Platform / partner account ids — must not be saved as a seller merchant id. */
export function paypalPlatformMerchantIds(): Set<string> {
  const ids = new Set<string>();
  const partner = process.env.PAYPAL_PARTNER_MERCHANT_ID?.trim();
  const direct = process.env.PAYPAL_DIRECT_MERCHANT_ID?.trim();
  if (partner) ids.add(partner);
  if (direct) ids.add(direct);
  return ids;
}

export function assertSellerPayPalMerchantId(merchantId: string): void {
  const id = merchantId.trim();
  if (paypalPlatformMerchantIds().has(id)) {
    throw new Error(
      "That merchant ID is the Vendl platform partner account, not your seller store. In PayPal Sandbox, open your Test Store business account and paste its merchant ID.",
    );
  }
}

/** Seller merchant id for PayPal-Auth-Assertion (null in direct / platform checkout). */
export function paypalSellerAuthMerchantId(
  merchantId: string | null | undefined,
): string | null {
  const id = merchantId?.trim();
  if (!id) return null;
  if (isPayPalDirectMode()) return null;
  const platformId = paypalDirectMerchantId();
  if (platformId && id === platformId) return null;
  return id;
}

export type PayPalFetchOptions = {
  /** Seller merchant id for PayPal-Auth-Assertion on marketplace API calls. */
  sellerMerchantId?: string | null;
  /** Send PayPal-Partner-Attribution-Id (BN code). Checkout only — wrong BN breaks partner APIs. */
  partnerAttribution?: boolean;
};

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
  options: PayPalFetchOptions = {},
): Promise<T> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  const bn = process.env.PAYPAL_BN_CODE?.trim();
  if (bn && options.partnerAttribution) {
    headers.set("PayPal-Partner-Attribution-Id", bn);
  } else if (
    isPayPalMarketplaceMode() &&
    options.sellerMerchantId &&
    options.partnerAttribution
  ) {
    console.warn(
      "[PayPal] PAYPAL_BN_CODE missing — set BN code for marketplace attribution",
    );
  }
  const sellerId = options.sellerMerchantId?.trim();
  if (sellerId && isPayPalMarketplaceMode()) {
    headers.set("PayPal-Auth-Assertion", paypalAuthAssertion(sellerId));
  }

  const res = await fetch(`${paypalApiBase()}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PayPal ${path} failed: ${res.status} ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
