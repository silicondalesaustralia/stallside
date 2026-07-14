import {
  isPayPalConfigured,
  paypalFetch,
  paypalPartnerMerchantId,
  appBaseUrl,
} from "@/lib/paypal";

export { isPayPalConfigured };

type Link = { href: string; rel: string; method?: string };

function actionUrl(links: Link[] | undefined): string | null {
  return links?.find((l) => l.rel === "action_url")?.href ?? null;
}

function approveUrl(links: Link[] | undefined): string | null {
  return links?.find((l) => l.rel === "approve" || l.rel === "payer-action")?.href ?? null;
}

export async function createPartnerReferralLink(input: {
  trackingId: string;
  email?: string | null;
  businessName: string;
}): Promise<string> {
  const base = appBaseUrl();
  const body = {
    tracking_id: input.trackingId,
    partner_config_override: {
      return_url: `${base}/dashboard/settings/paypal?return=1`,
      return_url_description: "Return to Stallside",
      show_add_credit_card: true,
    },
    operations: [
      {
        operation: "API_INTEGRATION",
        api_integration_preference: {
          rest_api_integration: {
            integration_method: "PAYPAL",
            integration_type: "THIRD_PARTY",
            third_party_details: {
              features: ["PAYMENT", "REFUND"],
            },
          },
        },
      },
    ],
    products: ["EXPRESS_CHECKOUT"],
    legal_consents: [{ type: "SHARE_DATA_CONSENT", granted: true }],
    email: input.email || undefined,
    business_entity: {
      business_type: { type: "INDIVIDUAL" },
      names: [{ business_name: input.businessName, type: "LEGAL_NAME" }],
    },
  };

  const data = await paypalFetch<{ links?: Link[] }>(
    "/v2/customer/partner-referrals",
    { method: "POST", body: JSON.stringify(body) },
  );
  const url = actionUrl(data.links);
  if (!url) throw new Error("PayPal did not return an onboarding link.");
  return url;
}

type MerchantStatus = {
  merchant_id?: string;
  payments_receivable?: boolean;
  primary_email_confirmed?: boolean;
  permissions_granted?: boolean | string;
};

export async function lookupMerchantByTrackingId(trackingId: string) {
  const partnerId = paypalPartnerMerchantId();
  return paypalFetch<{ merchant_id?: string; tracking_id?: string }>(
    `/v1/customer/partners/${partnerId}/merchant-integrations?tracking_id=${encodeURIComponent(trackingId)}`,
  );
}

export async function getMerchantIntegrationStatus(merchantId: string) {
  const partnerId = paypalPartnerMerchantId();
  return paypalFetch<MerchantStatus>(
    `/v1/customer/partners/${partnerId}/merchant-integrations/${merchantId}`,
  );
}

export function merchantPaymentsReady(status: MerchantStatus): boolean {
  if (!status.payments_receivable) return false;
  if (status.primary_email_confirmed === false) return false;
  if (
    status.permissions_granted === false ||
    status.permissions_granted === "false"
  ) {
    return false;
  }
  return true;
}

export async function createPayPalCheckoutOrder(input: {
  merchantId: string;
  orderId: string;
  currency: string;
  totalCents: number;
  description: string;
  cancelUrl: string;
  successUrl: string;
}): Promise<{ paypalOrderId: string; approveUrl: string }> {
  const value = (input.totalCents / 100).toFixed(2);
  const data = await paypalFetch<{ id: string; links?: Link[] }>("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: input.orderId,
          custom_id: input.orderId,
          description: input.description.slice(0, 127),
          amount: {
            currency_code: input.currency.toUpperCase(),
            value,
          },
          payee: { merchant_id: input.merchantId },
        },
      ],
      application_context: {
        brand_name: "Stallside",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
        return_url: input.successUrl,
        cancel_url: input.cancelUrl,
      },
    }),
  });

  const url = approveUrl(data.links);
  if (!url) throw new Error("PayPal did not return an approve URL.");
  return { paypalOrderId: data.id, approveUrl: url };
}

export async function capturePayPalOrder(paypalOrderId: string) {
  return paypalFetch<{
    id: string;
    status?: string;
    purchase_units?: Array<{
      payments?: { captures?: Array<{ id: string; status?: string }> };
    }>;
  }>(`/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    body: "{}",
  });
}
