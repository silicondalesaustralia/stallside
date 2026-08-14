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
import { PaymentMethod } from "@/generated/prisma/client";
import { formatCollectionLabel } from "@/lib/pre-order";
import { restockOptInForOrder } from "./restock-opt-in-gate";
import {
  applyDemo,
  applyFulfillResult,
  emptySuccessState,
  type PreOrderSuccessInfo,
  type SuccessPageState,
} from "./success-state";

export type { SuccessPageState };

function preOrderInfo(order: {
  isPreOrder: boolean;
  collectionAt: Date | null;
  collectionNote: string | null;
  customerName: string | null;
  items: { productNameSnapshot: string; quantity: number; optionsSnapshot?: string | null }[];
}): PreOrderSuccessInfo | null {
  if (!order.isPreOrder || !order.collectionAt) return null;
  return {
    collectionLabel: formatCollectionLabel(order.collectionAt),
    collectionNote: order.collectionNote,
    customerName: order.customerName,
    items: order.items.map((i) => ({
      name: i.optionsSnapshot
        ? `${i.productNameSnapshot} (${i.optionsSnapshot})`
        : i.productNameSnapshot,
      quantity: i.quantity,
    })),
  };
}

export async function resolveCheckoutSuccess(params: {
  session_id?: string;
  order_id?: string;
  paypal?: string;
  token?: string;
  sub?: string;
}): Promise<SuccessPageState> {
  if (params.sub) {
    return resolveShopperSubSuccess(params.sub, params.session_id);
  }
  if (params.session_id) return resolveStripeSuccess(params.session_id);
  if (
    (params.paypal === "1" || params.token) &&
    params.order_id &&
    isPayPalConfigured()
  ) {
    return resolvePayPalSuccess(params.order_id, params.token);
  }
  return emptySuccessState();
}

async function resolveShopperSubSuccess(
  shopperSubscriptionId: string,
  checkoutSessionId?: string,
): Promise<SuccessPageState> {
  const state = emptySuccessState();
  try {
    const { syncShopperSubFromSuccessSession } = await import(
      "@/lib/shopper-subscription-webhook"
    );
    const ok = await syncShopperSubFromSuccessSession({
      shopperSubscriptionId,
      checkoutSessionId,
    });
    const row = await prisma.shopperSubscription.findUnique({
      where: { id: shopperSubscriptionId },
      include: {
        offer: { select: { title: true, collectionNote: true } },
        stand: { select: { name: true } },
      },
    });
    if (!row) {
      state.message = "Subscription not found.";
      return state;
    }
    state.message = ok
      ? `You're subscribed to ${row.offer.title} from ${row.stand.name}. Check your email for the manage link.`
      : "Payment received — your subscription will activate shortly.";
    if (row.offer.collectionNote) {
      state.preOrder = {
        collectionLabel: "Each billing cycle",
        collectionNote: row.offer.collectionNote,
        customerName: row.customerName,
        items: [],
      };
    }
  } catch (error) {
    console.error("Shopper subscription success sync failed", error);
    state.message =
      "Payment received — your subscription will activate shortly.";
  }
  return state;
}

async function resolveStripeSuccess(
  sessionId: string,
): Promise<SuccessPageState> {
  const state = emptySuccessState();
  try {
    const order = await prisma.order.findFirst({
      where: { stripeCheckoutSessionId: sessionId },
      include: {
        owner: { include: { user: { select: { email: true, role: true } } } },
        stand: { select: { id: true, slug: true, name: true } },
        items: true,
      },
    });
    applyDemo(state, order);

    const demo =
      order?.stand && isDemoStandSlug(order.stand.slug)
        ? resolveDemoCardStripe(order.owner)
        : null;
    const stripe = demo?.stripe ?? (isStripeConfigured() ? getStripe() : null);
    const stripeAccountId =
      demo?.stripeAccountId ?? order?.owner.stripeAccountId ?? null;
    if (!order || !stripe || !stripeAccountId) return state;

    const session = await stripe.checkout.sessions.retrieve(
      sessionId,
      undefined,
      { stripeAccount: stripeAccountId },
    );
    if (session.payment_status !== "paid") {
      // PayTo / async methods: do not fulfill until paid (webhook will).
      state.message =
        "Thanks - your payment is being confirmed. If you paid with PayTo or another bank method, this can take a moment. Stock updates when payment clears.";
      return state;
    }

    const paymentIntent =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;
    const result = await fulfillPaidCardOrder(order.id, paymentIntent);
    const confirmed = applyFulfillResult(state, result);
    state.preOrder = preOrderInfo(order);
    if (state.preOrder && confirmed) {
      state.message = `Payment confirmed. Collect on ${state.preOrder.collectionLabel}.`;
    }
    state.restock = order.isPreOrder
      ? null
      : restockOptInForOrder(
          order,
          confirmed,
          session.customer_details?.email ??
            session.customer_email ??
            order.receiptEmail,
        );
  } catch (error) {
    console.error("Checkout success fulfillment failed", error);
    state.message =
      "Payment received - stock will update shortly if not already.";
  }
  return state;
}

async function resolvePayPalSuccess(
  orderId: string,
  token?: string,
): Promise<SuccessPageState> {
  const state = emptySuccessState();
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        owner: { include: { user: { select: { email: true, role: true } } } },
        stand: { select: { id: true, slug: true, name: true } },
        items: true,
      },
    });
    if (!order || order.paymentMethod !== PaymentMethod.PAYPAL) {
      state.message = "PayPal order not found.";
      return state;
    }
    applyDemo(state, order);
    const paypalOrderId = token || order.paypalOrderId;
    if (!paypalOrderId) {
      state.message = "PayPal payment token missing.";
      return state;
    }
    const captured = await capturePayPalOrder(paypalOrderId);
    const captureId =
      captured.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;
    const result = await fulfillPaidPayPalOrder(order.id, captureId);
    const confirmed = applyFulfillResult(state, result);
    state.preOrder = preOrderInfo(order);
    state.restock = order.isPreOrder
      ? null
      : restockOptInForOrder(order, confirmed, order.receiptEmail);
  } catch (error) {
    console.error("PayPal success fulfillment failed", error);
    state.message =
      "Payment received - stock will update shortly if not already.";
  }
  return state;
}
