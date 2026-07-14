import Link from "next/link";
import { fulfillPaidCardOrder } from "@/lib/checkout";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  let message = "Thanks - your payment is being confirmed.";

  if (sessionId && isStripeConfigured()) {
    try {
      const order = await prisma.order.findFirst({
        where: { stripeCheckoutSessionId: sessionId },
        include: { owner: true },
      });

      if (order?.owner.stripeAccountId) {
        const session = await getStripe().checkout.sessions.retrieve(
          sessionId,
          undefined,
          { stripeAccount: order.owner.stripeAccountId },
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
  }

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
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
        <p className="mt-3 text-[var(--muted)]">{message}</p>
      </div>
      <Link
        href="/"
        className="mt-8 text-sm font-medium text-[var(--leaf-dark)] underline"
      >
        Back to {APP_NAME}
      </Link>
    </main>
  );
}
