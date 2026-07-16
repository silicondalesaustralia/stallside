import { NextRequest, NextResponse } from "next/server";
import { isPayPalConfigured } from "@/lib/paypal";
import {
  handlePayPalWebhookEvent,
  verifyPayPalWebhookSignature,
} from "@/lib/paypal-webhook";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isPayPalConfigured() || !process.env.PAYPAL_WEBHOOK_ID) {
    return NextResponse.json(
      { error: "PayPal webhook not configured" },
      { status: 500 },
    );
  }

  const rawBody = await req.text();
  const valid = await verifyPayPalWebhookSignature(req.headers, rawBody);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    await handlePayPalWebhookEvent(rawBody);
  } catch (error) {
    console.error("PayPal webhook handler failed", error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
