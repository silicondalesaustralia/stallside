import Link from "next/link";
import DemoSaleNotify from "@/components/DemoSaleNotify";
import {
  fulfillPaidCardOrder,
  fulfillPaidPayPalOrder,
} from "@/lib/fulfill-paid-order";
import { isDemoStandSlug } from "@/lib/demo";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { resolveDemoCardStripe } from "@/lib/stripe-demo";
import { isPayPalConfigured } from "@/lib/paypal";
import { capturePayPalOrder } from "@/lib/paypal-orders";
import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";
import { PaymentMethod } from "@/generated/prisma/client";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    session_id?: string;
    order_id?: string;
    paypal?: string;
    token?: string;
  }>;
}) {
  const params = await searchParams;
  let message = "Thanks - your payment is being confirmed.";
  let demoStandSlug: string | null = null;
  let demoTotalCents: number | undefined;
  let demoCurrency: string | undefined;

  if (params.session_id) {
    try {
      const order = await prisma.order.findFirst({
        where: { stripeCheckoutSessionId: params.session_id },
        include: { owner: true, stand: { select: { slug: true } } },
      });
      if (order?.stand && isDemoStandSlug(order.stand.slug)) {
        demoStandSlug = order.stand.slug;
        demoTotalCents = order.totalCents;
        demoCurrency = order.currency;
      }

      const demo =
        order?.stand && isDemoStandSlug(order.stand.slug)
          ? resolveDemoCardStripe(order.owner)
          : null;
      const stripe = demo?.stripe ?? (isStripeConfigured() ? getStripe() : null);
      const stripeAccountId =
        demo?.stripeAccountId ?? order?.owner.stripeAccountId ?? null;

      if (order && stripe && stripeAccountId) {
        const session = await stripe.checkout.sessions.retrieve(
          params.session_id,
          undefined,
          { stripeAccount: stripeAccountId },
        );

        if (session.payment_status === "paid") {
          const paymentIntent =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id;
          const result = await fulfillPaidCardOrder(order.id, paymentIntent);
          if ("orderNumber" in result && result.orderNumber) {
            message = "Payment confirmed. You're all set.";
          } else if ("error" in result && result.error) {
            message = result.error;
          }
        }
      }
    } catch (error) {
      console.error("Checkout success fulfillment failed", error);
      message = "Payment received - stock will update shortly if not already.";
    }
  } else if (
    (params.paypal === "1" || params.token) &&
    params.order_id &&
    isPayPalConfigured()
  ) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: params.order_id },
      });
      if (!order || order.paymentMethod !== PaymentMethod.PAYPAL) {
        message = "PayPal order not found.";
      } else {
        const paypalOrderId = params.token || order.paypalOrderId;
        if (!paypalOrderId) {
          message = "PayPal payment token missing.";
        } else {
          const captured = await capturePayPalOrder(paypalOrderId);
          const captureId =
            captured.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;
          const result = await fulfillPaidPayPalOrder(order.id, captureId);
          if ("orderNumber" in result && result.orderNumber) {
            message = "Payment confirmed. You're all set.";
          } else if ("error" in result && result.error) {
            message = result.error;
          }
        }
      }
    } catch (error) {
      console.error("PayPal success fulfillment failed", error);
      message = "Payment received - stock will update shortly if not already.";
    }
  }

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
      <DemoSaleNotify
        standSlug={demoStandSlug}
        via="card"
        totalCents={demoTotalCents}
        currency={demoCurrency}
      />
      <div className="relative rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-8">
        <div
          aria-hidden
          className="absolute left-4 top-4 size-8 border-l-[3px] border-t-[3px] border-[var(--leaf)]"
          style={{ borderTopLeftRadius: 8 }}
        />
        <p className="font-receipt text-4xl text-[var(--leaf)]" aria-hidden>
          ✓
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)]">
          Thank you
        </h1>
        <p className="mt-3 text-xl text-[var(--muted)]">{message}</p>
      </div>
      <Link
        href="/"
        className="mt-8 inline-flex w-full items-center justify-center rounded-[var(--radius-pill)] border border-[var(--line)] bg-[var(--panel)] px-6 py-4 text-lg font-semibold text-[var(--ink)]"
      >
        Back to {APP_NAME}
      </Link>
    </main>
  );
}
