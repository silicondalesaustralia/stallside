import {
  isPayPalDirectMode,
  paypalDirectMerchantId,
  paypalFetch,
} from "@/lib/paypal";

type Link = { href: string; rel: string; method?: string };

function approveUrl(links: Link[] | undefined): string | null {
  return (
    links?.find((l) => l.rel === "approve" || l.rel === "payer-action")?.href ??
    null
  );
}

type PayPalOrderResult = {
  id: string;
  status?: string;
  purchase_units?: Array<{
    payments?: { captures?: Array<{ id: string; status?: string }> };
  }>;
};

function moneyValue(cents: number): string {
  return (cents / 100).toFixed(2);
}

export async function createPayPalCheckoutOrder(input: {
  merchantId: string;
  orderId: string;
  currency: string;
  totalCents: number;
  /** Vendl Connect fee in cents; only applied in marketplace (non-direct) mode. */
  platformFeeCents?: number;
  description: string;
  cancelUrl: string;
  successUrl: string;
}): Promise<{ paypalOrderId: string; approveUrl: string }> {
  const currency = input.currency.toUpperCase();
  const value = moneyValue(input.totalCents);
  // Own-account / direct mode: omit payee (platform REST app receives funds).
  // Marketplace: set payee to the seller merchant id.
  const platformId = paypalDirectMerchantId();
  const useOwnAccount =
    Boolean(platformId) && input.merchantId === platformId;
  const marketplace =
    !useOwnAccount && !isPayPalDirectMode() && Boolean(input.merchantId);

  const purchaseUnit: Record<string, unknown> = {
    reference_id: input.orderId,
    custom_id: input.orderId,
    description: input.description.slice(0, 127),
    amount: {
      currency_code: currency,
      value,
    },
  };
  if (!useOwnAccount) {
    purchaseUnit.payee = { merchant_id: input.merchantId };
  }

  const feeCents = input.platformFeeCents ?? 0;
  if (marketplace) {
    const instruction: Record<string, unknown> = {
      disbursement_mode: "INSTANT",
    };
    if (feeCents > 0) {
      instruction.platform_fees = [
        {
          amount: {
            currency_code: currency,
            value: moneyValue(feeCents),
          },
        },
      ];
    }
    purchaseUnit.payment_instruction = instruction;
  }

  const data = await paypalFetch<{ id: string; links?: Link[] }>(
    "/v2/checkout/orders",
    {
      method: "POST",
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [purchaseUnit],
        application_context: {
          brand_name: "Vendl",
          // Prefer login in sandbox; live allows login or guest card.
          landing_page:
            (process.env.PAYPAL_MODE || "sandbox").toLowerCase() === "live"
              ? "NO_PREFERENCE"
              : "LOGIN",
          user_action: "PAY_NOW",
          shipping_preference: "NO_SHIPPING",
          return_url: input.successUrl,
          cancel_url: input.cancelUrl,
        },
      }),
    },
    marketplace ? { sellerMerchantId: input.merchantId, partnerAttribution: true } : {},
  );

  const url = approveUrl(data.links);
  if (!url) throw new Error("PayPal did not return an approve URL.");
  return { paypalOrderId: data.id, approveUrl: url };
}

export async function getPayPalOrder(
  paypalOrderId: string,
  sellerMerchantId?: string | null,
) {
  return paypalFetch<PayPalOrderResult>(
    `/v2/checkout/orders/${paypalOrderId}`,
    {},
    sellerMerchantId ? { sellerMerchantId, partnerAttribution: true } : {},
  );
}

export async function capturePayPalOrder(
  paypalOrderId: string,
  sellerMerchantId?: string | null,
) {
  const authOpts = sellerMerchantId
    ? { sellerMerchantId, partnerAttribution: true as const }
    : {};
  try {
    return await paypalFetch<PayPalOrderResult>(
      `/v2/checkout/orders/${paypalOrderId}/capture`,
      { method: "POST", body: "{}" },
      authOpts,
    );
  } catch (error) {
    const existing = await getPayPalOrder(paypalOrderId, sellerMerchantId);
    if (existing.status === "COMPLETED") return existing;
    throw error;
  }
}
