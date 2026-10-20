import { prisma } from "@/lib/prisma";
import { PaymentMethod, PaymentStatus } from "@/generated/prisma/client";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import {
  getSquareConnection,
  getValidSquareAccessToken,
} from "@/lib/square/connection";
import {
  paypalCaptureFee,
  squarePaymentFee,
  stripePaymentFee,
  type ProcessorFee,
} from "./provider-fees";

/** Square can take a while to report fees; after this, save what we have and stop retrying. */
const GIVE_UP_AFTER_MS = 3 * 24 * 60 * 60 * 1000;

type FeeOrder = {
  id: string;
  ownerId: string;
  paymentMethod: PaymentMethod;
  stripePaymentIntentId: string | null;
  balancePaymentIntentId: string | null;
  squarePaymentId: string | null;
  balanceSquarePaymentId: string | null;
  paypalCaptureId: string | null;
  owner: { stripeAccountId: string | null };
};

function present(ids: (string | null)[]): string[] {
  return ids.filter((id): id is string => Boolean(id));
}

async function fetchFees(order: FeeOrder): Promise<(ProcessorFee | null)[]> {
  if (order.paymentMethod === PaymentMethod.CARD) {
    const account = order.owner.stripeAccountId;
    if (!account || !isStripeConfigured()) return [];
    const ids = present([order.stripePaymentIntentId, order.balancePaymentIntentId]);
    return Promise.all(ids.map((id) => stripePaymentFee(getStripe(), account, id)));
  }
  if (order.paymentMethod === PaymentMethod.SQUARE) {
    const conn = await getSquareConnection(order.ownerId);
    const token = conn ? await getValidSquareAccessToken(conn.id) : null;
    if (!token) return [];
    const ids = present([order.squarePaymentId, order.balanceSquarePaymentId]);
    return Promise.all(ids.map((id) => squarePaymentFee(token, id)));
  }
  if (order.paymentMethod === PaymentMethod.PAYPAL && order.paypalCaptureId) {
    return [await paypalCaptureFee(order.paypalCaptureId)];
  }
  return [];
}

/**
 * Save the processor fee for a fully paid online order.
 * Returns "pending" when the provider has not reported the fee yet.
 */
export async function syncOrderProcessorFees(
  orderId: string,
): Promise<"synced" | "pending" | "skipped"> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { owner: { select: { stripeAccountId: true } } },
  });
  if (!order || order.paymentStatus !== PaymentStatus.PAID) return "skipped";

  const fees = await fetchFees(order);
  const found = fees.filter((f): f is ProcessorFee => f != null);
  const missing = fees.length - found.length;
  const giveUp = Date.now() - order.createdAt.getTime() > GIVE_UP_AFTER_MS;
  if (missing > 0 && !giveUp) return "pending";

  const taxes = found.map((f) => f.taxCents).filter((t): t is number => t != null);
  await prisma.order.update({
    where: { id: order.id },
    data: {
      processorFeeCents: found.length
        ? found.reduce((sum, f) => sum + f.feeCents, 0)
        : null,
      processorFeeTaxCents: taxes.length
        ? taxes.reduce((sum, t) => sum + t, 0)
        : null,
      processorFeeCurrency: found[0]?.currency ?? null,
      processorFeesSyncedAt: new Date(),
    },
  });
  return "synced";
}
