import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";
import { SubscriptionStatus } from "@/generated/prisma/client";
import {
  sendTrialDay7,
  sendTrialDay14,
  sendTrialDay23,
  sendTrialDay30,
  sendTrialDay45,
} from "@/lib/lifecycle-emails";
import { daysAgo, markSent, recipient } from "@/lib/lifecycle-emails/cron-helpers";
import { runProLapseCron } from "@/lib/lifecycle-emails/run-pro-lapse-cron";

export const runtime = "nodejs";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const sent = {
    day7: 0,
    day14: 0,
    day23: 0,
    day30: 0,
    day45: 0,
    proLapse23: 0,
    proLapse45: 0,
  };

  const trialOwners = await prisma.owner.findMany({
    where: {
      lifetimeAccess: false,
      stripeSubscriptionId: null,
      OR: [
        { subscriptionStatus: SubscriptionStatus.TRIALING },
        {
          trialEndsAt: { not: null, lte: now },
          subscriptionPlan: { in: ["free", "starter", "cash"] },
        },
      ],
    },
    include: { user: { select: { email: true, name: true } } },
    take: 200,
  });

  for (const owner of trialOwners) {
    const r = recipient(owner);
    if (!r) continue;
    try {
      const onTrial =
        owner.subscriptionStatus === SubscriptionStatus.TRIALING &&
        owner.trialEndsAt != null &&
        owner.trialEndsAt.getTime() > now.getTime();

      if (onTrial && !owner.trialDay7SentAt && owner.createdAt <= daysAgo(7, now)) {
        await sendTrialDay7(r);
        await markSent(owner.id, "trialDay7SentAt", now);
        sent.day7 += 1;
      }
      if (onTrial && !owner.trialDay14SentAt && owner.createdAt <= daysAgo(14, now)) {
        await sendTrialDay14(r);
        await markSent(owner.id, "trialDay14SentAt", now);
        sent.day14 += 1;
      }
      if (onTrial && !owner.trialDay23SentAt && owner.createdAt <= daysAgo(23, now)) {
        await sendTrialDay23(r);
        await markSent(owner.id, "trialDay23SentAt", now);
        sent.day23 += 1;
      }
      if (!owner.trialReminderSentAt && owner.trialEndsAt && owner.trialEndsAt <= now) {
        await sendTrialDay30(r);
        await markSent(owner.id, "trialReminderSentAt", now);
        await prisma.owner.update({
          where: { id: owner.id },
          data: {
            subscriptionStatus: SubscriptionStatus.NONE,
            subscriptionPlan: "free",
            monthlyFeeCents: 0,
          },
        });
        sent.day30 += 1;
      }
      if (
        !owner.trialDay45SentAt &&
        owner.trialEndsAt &&
        owner.trialEndsAt <= daysAgo(15, now)
      ) {
        const monthStart = daysAgo(14, now);
        const [cardInterestCount, restockCount] = await Promise.all([
          prisma.cardInterest.count({
            where: {
              stand: { ownerId: owner.id },
              createdAt: { gte: monthStart },
            },
          }),
          prisma.restockSubscriber.count({
            where: {
              stand: { ownerId: owner.id },
              unsubscribedAt: null,
            },
          }),
        ]);
        await sendTrialDay45(r, { cardInterestCount, restockCount });
        await markSent(owner.id, "trialDay45SentAt", now);
        sent.day45 += 1;
      }
    } catch (error) {
      console.error(`[${APP_NAME}] trial lifecycle email failed`, owner.id, error);
    }
  }

  const lapse = await runProLapseCron(now);
  sent.proLapse23 = lapse.day23;
  sent.proLapse45 = lapse.day45;

  return NextResponse.json({
    checkedTrial: trialOwners.length,
    checkedProLapse: lapse.checked,
    sent,
  });
}
