import { OnlinePaymentProvider, ShopperSubStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { SquareApiError } from "@/lib/square/client";
import { getValidSquareAccessToken } from "@/lib/square/connection";
import { createSquareCustomer, disableSquareCard, saveSquareCard } from "@/lib/square/customers-cards";
import { squareRenewalRail } from "@/lib/square-subscriptions/rail";
import { renewSquareSubscription } from "@/lib/square-subscriptions/renew";

/** Swap the saved card; if a payment is overdue, retry it straight away. */
export async function updateSquareSubscriptionCard(input: {
  manageToken: string;
  sourceId: string;
}): Promise<{ ok: true; message: string } | { error: string }> {
  const sub = await prisma.shopperSubscription.findUnique({
    where: { manageToken: input.manageToken },
  });
  if (!sub || sub.paymentProvider !== OnlinePaymentProvider.SQUARE) {
    return { error: "Subscription not found." };
  }
  if (sub.status === ShopperSubStatus.CANCELLED || sub.status === ShopperSubStatus.INCOMPLETE) {
    return { error: "This subscription is no longer active." };
  }
  const rail = await squareRenewalRail(sub.ownerId);
  const token = rail ? await getValidSquareAccessToken(rail.connectionId) : null;
  if (!token) return { error: "The farm can't take card payments right now." };

  let card: { cardId: string; label: string };
  try {
    const customerId =
      sub.squareCustomerId ??
      (await createSquareCustomer({
        accessToken: token,
        idempotencyKey: `vsc-${sub.id}`,
        name: sub.customerName,
        email: sub.customerEmail,
        phone: sub.customerPhone,
        referenceId: sub.id,
      }));
    card = await saveSquareCard({
      accessToken: token,
      idempotencyKey: `vscu-${sub.id}-${input.sourceId.slice(-12)}`,
      sourceId: input.sourceId,
      customerId,
      referenceId: sub.id,
    });
    await prisma.shopperSubscription.update({
      where: { id: sub.id },
      data: { squareCustomerId: customerId, squareCardId: card.cardId, squareCardLabel: card.label },
    });
  } catch (error) {
    console.error("Square card update failed", sub.id, error);
    if (error instanceof SquareApiError && error.status < 500) {
      return { error: `Card was not accepted: ${error.message}` };
    }
    return { error: "Could not save the card. Try again." };
  }

  if (sub.squareCardId && sub.squareCardId !== card.cardId) {
    try {
      await disableSquareCard({ accessToken: token, cardId: sub.squareCardId });
    } catch (error) {
      console.error("Old Square card disable failed", sub.id, error);
    }
  }

  if (sub.status !== ShopperSubStatus.PAST_DUE) {
    return { ok: true, message: `Card updated to ${card.label}.` };
  }
  await prisma.shopperSubscription.update({
    where: { id: sub.id },
    data: { billingRetryAt: null },
  });
  const outcome = await renewSquareSubscription(sub.id, new Date());
  if (outcome === "paid") return { ok: true, message: `Card updated and payment taken. Thanks!` };
  if (outcome === "cancelled") return { error: "The new card was declined and the subscription was cancelled." };
  if (outcome === "retry") return { error: "Card saved, but the payment was declined. Try another card." };
  return { ok: true, message: `Card updated. We'll retry the payment shortly.` };
}
