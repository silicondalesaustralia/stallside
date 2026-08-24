import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@/generated/prisma/client";
import { isDemoStandSlug } from "@/lib/demo";
import { sendCancellationFeedback } from "@/lib/lifecycle-emails/cancellation";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export type WipeOwnerResult =
  | { ok: true }
  | { error: string };

/**
 * Soft-close an owner account: keep all Vendl data, stop marketing/alert
 * emails and stands, cancel SaaS billing. Existing JWTs stop working because
 * getAuthSession / requireOwner reject deletedAt.
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
  if (owner.deletedAt) return { ok: true };

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

  if (!skipFeedback && !owner.cancelFeedbackSentAt) {
    const feedbackTo = (owner.user.email || owner.contactEmail || "").trim();
    if (feedbackTo.includes("@")) {
      try {
        await sendCancellationFeedback({
          to: feedbackTo,
          name: owner.user.name || owner.businessName,
        });
        await prisma.owner.update({
          where: { id: ownerId },
          data: { cancelFeedbackSentAt: new Date() },
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
  }

  const now = new Date();
  const userId = owner.user.id;

  await prisma.$transaction(
    async (tx) => {
      await tx.stand.updateMany({
        where: { ownerId },
        data: { isActive: false },
      });
      await tx.pushDevice.deleteMany({ where: { ownerId } });
      await tx.session.deleteMany({ where: { userId } });
      await tx.owner.update({
        where: { id: ownerId },
        data: {
          deletedAt: now,
          emailAlertsEnabled: false,
          pushAlertsEnabled: false,
          stripeSubscriptionId: null,
          subscriptionStatus: SubscriptionStatus.CANCELLED,
          cancelAtPeriodEnd: false,
          currentPeriodEndsAt: null,
        },
      });
    },
    { maxWait: 15_000, timeout: 60_000 },
  );

  return { ok: true };
}
