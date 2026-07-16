import { paypalFetch } from "@/lib/paypal";

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
  const data = await paypalFetch<{ id: string; links?: Link[] }>(
    "/v2/checkout/orders",
    {
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
    },
  );

  const url = approveUrl(data.links);
  if (!url) throw new Error("PayPal did not return an approve URL.");
  return { paypalOrderId: data.id, approveUrl: url };
}

export async function getPayPalOrder(paypalOrderId: string) {
  return paypalFetch<PayPalOrderResult>(
    `/v2/checkout/orders/${paypalOrderId}`,
  );
}

export async function capturePayPalOrder(paypalOrderId: string) {
  try {
    return await paypalFetch<PayPalOrderResult>(
      `/v2/checkout/orders/${paypalOrderId}/capture`,
      { method: "POST", body: "{}" },
    );
  } catch (error) {
    const existing = await getPayPalOrder(paypalOrderId);
    if (existing.status === "COMPLETED") return existing;
    throw error;
  }
}
