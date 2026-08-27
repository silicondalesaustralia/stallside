import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";
import { daysAgo, markSent, recipient } from "@/lib/lifecycle-emails/cron-helpers";
import { maybeSendStripeRestrictedNudge } from "@/lib/lifecycle-emails/send-stripe-nudges";
import { sendStripeNeverStartedNudge } from "@/lib/lifecycle-emails/stripe-never-started";

const NEVER_STARTED_MIN_DAYS = 3;

/** Backup nudge for restricted Connect accounts (webhook may have missed). */
export async function runStripeRestrictedNudgeCron(now: Date): Promise<{
  checked: number;
  sent: number;
}> {
  const owners = await prisma.owner.findMany({
    where: {
      deletedAt: null,
      stripeAccountId: { not: null },
      stripeChargesEnabled: false,
      stripeRestrictedNudgeSentAt: null,
      OR: [
        { stripeOnboardingComplete: true },
        {
          stripeConnectStartedAt: {
            lte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          },
        },
      ],
    },
    select: { id: true },
    take: 100,
  });

  let sent = 0;
  for (const owner of owners) {
    const ok = await maybeSendStripeRestrictedNudge(owner.id);
    if (ok) sent += 1;
  }

  return { checked: owners.length, sent };
}

/** Gentle nudge when stand has products but Stripe was never connected. */
export async function runStripeNeverStartedNudgeCron(now: Date): Promise<{
  checked: number;
  sent: number;
}> {
  const owners = await prisma.owner.findMany({
    where: {
      deletedAt: null,
      stripeAccountId: null,
      stripeNeverStartedNudgeSentAt: null,
      createdAt: { lte: daysAgo(NEVER_STARTED_MIN_DAYS, now) },
      stands: { some: {} },
      products: { some: { isArchived: false } },
    },
    include: { user: { select: { email: true, name: true } } },
    take: 100,
  });

  let sent = 0;

  for (const owner of owners) {
    const r = recipient(owner);
    if (!r) continue;
    try {
      await sendStripeNeverStartedNudge(r);
      await markSent(owner.id, "stripeNeverStartedNudgeSentAt", now);
      sent += 1;
    } catch (error) {
      console.error(
        `[${APP_NAME}] stripe never-started nudge failed`,
        owner.id,
        error,
      );
    }
  }

  return { checked: owners.length, sent };
}
