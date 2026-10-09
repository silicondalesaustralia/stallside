/** Refund a failed DomainPurchase after payment. */

import { prisma } from "@/lib/prisma";
import { DomainPurchaseStatus } from "@/generated/prisma/client";
import { getStripe } from "@/lib/stripe";

export async function refundDomainPurchase(purchaseId: string): Promise<void> {
  const purchase = await prisma.domainPurchase.findUnique({
    where: { id: purchaseId },
  });
  if (!purchase) return;

  let paymentIntentId = purchase.stripePaymentIntentId;
  if (!paymentIntentId && purchase.stripeCheckoutSessionId) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(
        purchase.stripeCheckoutSessionId,
      );
      paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null;
    } catch (e) {
      console.error("domain purchase session retrieve failed", purchaseId, e);
    }
  }
  if (!paymentIntentId) return;

  try {
    await getStripe().refunds.create({ payment_intent: paymentIntentId });
    await prisma.domainPurchase.update({
      where: { id: purchaseId },
      data: { status: DomainPurchaseStatus.REFUNDED },
    });
  } catch (e) {
    console.error("domain purchase refund failed", purchaseId, e);
  }
}
