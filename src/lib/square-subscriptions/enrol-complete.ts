import { OnlinePaymentProvider, ShopperSubStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { SquareApiError } from "@/lib/square/client";
import { getValidSquareAccessToken } from "@/lib/square/connection";
import { createSquareCustomer, saveSquareCard } from "@/lib/square/customers-cards";
import { createSquarePayment } from "@/lib/square/payments";
import { membershipActivateFields, sendWelcome } from "@/lib/shopper-subscription-activate";
import { squareSubscriptionRail } from "@/lib/square-subscriptions/rail";
import {
  recordSquareSubscriptionPayment,
  squareSubscriptionFeeCents,
} from "@/lib/square-subscriptions/record-payment";

function declineMessage(error: unknown): string {
  if (error instanceof SquareApiError && error.status < 500) {
    return `Card was not accepted: ${error.message}`;
  }
  return "Card payment failed. Try again.";
}

/** Charge the first period, save the card for renewals, and activate the subscription. */
export async function completeSquareSubscriptionSignup(input: {
  manageToken: string;
  sourceId: string;
}): Promise<{ ok: true } | { error: string }> {
  const sub = await prisma.shopperSubscription.findUnique({
    where: { manageToken: input.manageToken },
    include: { offer: true, stand: true, owner: true },
  });
  if (!sub || sub.paymentProvider !== OnlinePaymentProvider.SQUARE) {
    return { error: "Signup not found. Start again." };
  }
  if (sub.status === ShopperSubStatus.ACTIVE) return { ok: true };
  if (sub.status !== ShopperSubStatus.INCOMPLETE || sub.recurringPriceCents == null) {
    return { error: "This signup can no longer be completed. Start again." };
  }

  const rail = await squareSubscriptionRail({
    stand: sub.stand,
    owner: sub.owner,
    offerCurrency: sub.offer.currency,
  });
  if (!rail) return { error: "This farm can't take card subscriptions right now." };
  const token = await getValidSquareAccessToken(rail.connectionId);
  if (!token) return { error: "This farm can't take card subscriptions right now." };

  const now = new Date();
  const claimed = await prisma.shopperSubscription.updateMany({
    where: {
      id: sub.id,
      status: ShopperSubStatus.INCOMPLETE,
      OR: [{ billingLockedUntil: null }, { billingLockedUntil: { lt: now } }],
    },
    data: { billingLockedUntil: new Date(now.getTime() + 2 * 60_000) },
  });
  if (claimed.count === 0) return { error: "Payment is already being processed." };
  const release = () =>
    prisma.shopperSubscription.update({
      where: { id: sub.id },
      data: { billingLockedUntil: null },
    });

  let customerId = sub.squareCustomerId;
  if (!customerId) {
    try {
      customerId = await createSquareCustomer({
        accessToken: token,
        idempotencyKey: `vsc-${sub.id}`,
        name: sub.customerName,
        email: sub.customerEmail,
        phone: sub.customerPhone,
        referenceId: sub.id,
      });
    } catch (error) {
      console.error("Square customer create failed", sub.id, error);
      await release();
      return { error: "Could not set up card payments. Try again." };
    }
    await prisma.shopperSubscription.update({
      where: { id: sub.id },
      data: { squareCustomerId: customerId },
    });
  }

  const amountCents = sub.recurringPriceCents;
  const currency = sub.offer.currency;
  const appFeeCents = squareSubscriptionFeeCents(sub.owner, amountCents, currency);
  let paymentId: string;
  let feeTakenCents = 0;
  try {
    const res = await createSquarePayment({
      accessToken: token,
      sourceId: input.sourceId,
      customerId,
      amountCents,
      currency,
      locationId: rail.locationId,
      idempotencyKey: `vsf-${sub.id}-${input.sourceId.slice(-12)}`,
      appFeeCents,
      referenceId: sub.id,
      note: `Vendl subscription: ${sub.offer.title}`,
      buyerEmail: sub.customerEmail,
    });
    const status = res.payment?.status;
    if (!res.payment?.id || status !== "COMPLETED") {
      await release();
      return { error: "Card payment was not completed. Try again." };
    }
    paymentId = res.payment.id;
    feeTakenCents = res.payment.app_fee_money?.amount ?? 0;
  } catch (error) {
    console.error("Square subscription first charge failed", sub.id, error);
    await release();
    return { error: declineMessage(error) };
  }

  let card: { cardId: string; label: string } | null = null;
  try {
    card = await saveSquareCard({
      accessToken: token,
      idempotencyKey: `vscard-${sub.id}`,
      sourceId: paymentId,
      customerId,
      referenceId: sub.id,
    });
  } catch (error) {
    console.error("Square subscription card save failed; renewal will ask for a card", sub.id, error);
  }

  await prisma.shopperSubscription.update({
    where: { id: sub.id },
    data: {
      status: ShopperSubStatus.ACTIVE,
      squareCardId: card?.cardId ?? null,
      squareCardLabel: card?.label ?? null,
      ...membershipActivateFields(sub),
    },
  });
  await recordSquareSubscriptionPayment({
    shopperSubscriptionId: sub.id,
    periodStart: now,
    amountCents,
    appFeeCents: feeTakenCents,
    currency,
    squarePaymentId: paymentId,
  });
  await sendWelcome(sub.id);
  return { ok: true };
}
