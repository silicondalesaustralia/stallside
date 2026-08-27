import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { summarizeStripeRequirements } from "@/lib/stripe-requirements-summary";
import { sendStripeNeverStartedNudge } from "@/lib/lifecycle-emails/stripe-never-started";
import { sendStripeRestrictedNudge } from "@/lib/lifecycle-emails/stripe-restricted";

const RESTRICTED_MIN_HOURS = 24;

function hoursAgo(hours: number, from = new Date()): Date {
  const d = new Date(from);
  d.setUTCHours(d.getUTCHours() - hours);
  return d;
}

function recipientEmail(owner: {
  contactEmail: string;
  user?: { email: string | null } | null;
}): string | null {
  const email = (owner.user?.email || owner.contactEmail || "").trim();
  return email.includes("@") ? email : null;
}

function isStuckInStripeSetup(owner: {
  stripeOnboardingComplete: boolean;
  stripeConnectStartedAt: Date | null;
}): boolean {
  if (owner.stripeOnboardingComplete) return true;
  if (!owner.stripeConnectStartedAt) return false;
  return owner.stripeConnectStartedAt <= hoursAgo(RESTRICTED_MIN_HOURS);
}

/** Send once when Connect is started but charges are still disabled. */
export async function maybeSendStripeRestrictedNudge(
  ownerId: string,
): Promise<boolean> {
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
    include: { user: { select: { email: true, name: true } } },
  });
  if (
    !owner ||
    owner.deletedAt ||
    !owner.stripeAccountId ||
    owner.stripeChargesEnabled ||
    owner.stripeRestrictedNudgeSentAt ||
    !isStuckInStripeSetup(owner)
  ) {
    return false;
  }

  const to = recipientEmail(owner);
  if (!to) return false;

  let missingItems: string[] = [];
  if (isStripeConfigured()) {
    try {
      const account = await getStripe().accounts.retrieve(owner.stripeAccountId);
      missingItems = summarizeStripeRequirements(account);
    } catch (error) {
      console.error(`[${APP_NAME}] Stripe requirements fetch failed`, ownerId, error);
    }
  }

  try {
    await sendStripeRestrictedNudge({
      to,
      name: owner.user?.name || owner.businessName,
      missingItems,
    });
    await prisma.owner.update({
      where: { id: ownerId },
      data: { stripeRestrictedNudgeSentAt: new Date() },
    });
    return true;
  } catch (error) {
    console.error(`[${APP_NAME}] stripe restricted nudge failed`, ownerId, error);
    return false;
  }
}
