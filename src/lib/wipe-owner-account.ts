import { prisma } from "@/lib/prisma";
import { isDemoStandSlug } from "@/lib/demo";
import { sendCancellationFeedback } from "@/lib/lifecycle-emails/cancellation";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export type WipeOwnerResult =
  | { ok: true }
  | { error: string };

/**
 * Cancel Stripe billing/Connect, send goodbye email, hard-delete owner + user
 * and all stands/products/orders. Shared by self-serve and admin delete.
 */
export async function wipeOwnerAccount(
  ownerId: string,
  options?: {
    /** Self-serve blocks demo-stand owners; admin may override. */
    allowDemoStands?: boolean;
    /** Skip the cancellation feedback email. Free for Life owners are always skipped. */
    skipFeedbackEmail?: boolean;
  },
): Promise<WipeOwnerResult> {
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
    include: {
      user: { select: { id: true, email: true, name: true, role: true } },
      stands: { select: { id: true, slug: true } },
    },
  });
  if (!owner) return { error: "Owner not found." };

  if (
    !options?.allowDemoStands &&
    owner.stands.some((s) => isDemoStandSlug(s.slug))
  ) {
    return {
      error:
        "This account owns a demo stand and cannot be self-deleted. Contact support.",
    };
  }

  const skipFeedback =
    Boolean(options?.skipFeedbackEmail) || Boolean(owner.lifetimeAccess);

  if (!skipFeedback) {
    const feedbackTo = (owner.user.email || owner.contactEmail || "").trim();
    if (feedbackTo.includes("@")) {
      try {
        await sendCancellationFeedback({
          to: feedbackTo,
          name: owner.user.name || owner.businessName,
        });
      } catch (error) {
        console.error("wipeOwnerAccount: feedback email failed", error);
      }
    }
  }

  if (isStripeConfigured()) {
    const stripe = getStripe();
    if (owner.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(owner.stripeSubscriptionId);
      } catch (error) {
        console.error("wipeOwnerAccount: cancel subscription failed", error);
      }
    }
    if (owner.stripeCustomerId) {
      try {
        await stripe.customers.del(owner.stripeCustomerId);
      } catch (error) {
        console.error("wipeOwnerAccount: delete customer failed", error);
      }
    }
    if (owner.stripeAccountId) {
      try {
        await stripe.accounts.del(owner.stripeAccountId);
      } catch (error) {
        console.error("wipeOwnerAccount: delete Connect account failed", error);
      }
    }
  }

  const standIds = owner.stands.map((s) => s.id);
  const userId = owner.user.id;

  await prisma.$transaction(
    async (tx) => {
      if (standIds.length > 0) {
        const orders = await tx.order.findMany({
          where: { ownerId },
          select: { id: true },
        });
        const orderIds = orders.map((o) => o.id);
        if (orderIds.length > 0) {
          await tx.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
        }
        await tx.inventoryAdjustment.deleteMany({ where: { ownerId } });
        await tx.lowStockAlert.deleteMany({ where: { ownerId } });
        await tx.restockNotification.deleteMany({
          where: { standId: { in: standIds } },
        });
        await tx.restockSubscriber.deleteMany({
          where: { standId: { in: standIds } },
        });
        await tx.order.deleteMany({ where: { ownerId } });
        await tx.product.deleteMany({ where: { ownerId } });
        await tx.stand.deleteMany({ where: { ownerId } });
      }
      await tx.pushDevice.deleteMany({ where: { ownerId } });
      await tx.user.delete({ where: { id: userId } });
    },
    { maxWait: 15_000, timeout: 60_000 },
  );

  return { ok: true };
}
