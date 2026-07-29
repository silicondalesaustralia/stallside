import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";
import { SubscriptionStatus } from "@/generated/prisma/client";
import {
  sendCashUpgradeDay2,
  sendCashUpgradeDay7,
  sendCashUpgradeDay14,
  sendTrialDay7,
  sendTrialDay14,
  sendTrialDay28,
  sendTrialDay30,
} from "@/lib/lifecycle-emails";
import { daysAgo, markSent, recipient } from "@/lib/lifecycle-emails/cron-helpers";

export const runtime = "nodejs";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

type SentBucket = Record<string, number>;

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const sent: SentBucket = {
    day7: 0,
    day14: 0,
    day28: 0,
    day30: 0,
    cashDay2: 0,
    cashDay7: 0,
    cashDay14: 0,
  };

  const trialOwners = await prisma.owner.findMany({
    where: {
      subscriptionStatus: SubscriptionStatus.TRIALING,
      stripeSubscriptionId: null,
      lifetimeAccess: false,
    },
    include: { user: { select: { email: true, name: true } } },
    take: 200,
  });

  for (const owner of trialOwners) {
    const r = recipient(owner);
    if (!r) continue;
    try {
      if (!owner.trialDay7SentAt && owner.createdAt <= daysAgo(7, now)) {
        await sendTrialDay7(r);
        await markSent(owner.id, "trialDay7SentAt", now);
        sent.day7 += 1;
      }
      if (!owner.trialDay14SentAt && owner.createdAt <= daysAgo(14, now)) {
        await sendTrialDay14(r);
        await markSent(owner.id, "trialDay14SentAt", now);
        sent.day14 += 1;
      }
      if (
        !owner.trialDay28SentAt &&
        owner.trialEndsAt &&
        owner.trialEndsAt <= new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000) &&
        owner.trialEndsAt > now
      ) {
        await sendTrialDay28(r);
        await markSent(owner.id, "trialDay28SentAt", now);
        sent.day28 += 1;
      }
      if (
        !owner.trialReminderSentAt &&
        owner.trialEndsAt &&
        owner.trialEndsAt <= now
      ) {
        await sendTrialDay30(r);
        await markSent(owner.id, "trialReminderSentAt", now);
        sent.day30 += 1;
      }
    } catch (error) {
      console.error(`[${APP_NAME}] trial lifecycle email failed`, owner.id, error);
    }
  }

  const cashOwners = await prisma.owner.findMany({
    where: {
      lifetimeAccess: false,
      subscriptionPlan: "cash",
      cashSubscribedAt: { not: null },
      subscriptionStatus: {
        in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
      },
      stripeSubscriptionId: { not: null },
    },
    include: { user: { select: { email: true, name: true } } },
    take: 200,
  });

  for (const owner of cashOwners) {
    const r = recipient(owner);
    if (!r || !owner.cashSubscribedAt) continue;
    const subAt = owner.cashSubscribedAt;
    try {
      if (!owner.cashUpgradeDay2SentAt && subAt <= daysAgo(2, now)) {
        await sendCashUpgradeDay2(r);
        await markSent(owner.id, "cashUpgradeDay2SentAt", now);
        sent.cashDay2 += 1;
      }
      if (!owner.cashUpgradeDay7SentAt && subAt <= daysAgo(7, now)) {
        await sendCashUpgradeDay7(r);
        await markSent(owner.id, "cashUpgradeDay7SentAt", now);
        sent.cashDay7 += 1;
      }
      if (!owner.cashUpgradeDay14SentAt && subAt <= daysAgo(14, now)) {
        await sendCashUpgradeDay14(r);
        await markSent(owner.id, "cashUpgradeDay14SentAt", now);
        sent.cashDay14 += 1;
      }
    } catch (error) {
      console.error(`[${APP_NAME}] cash upgrade email failed`, owner.id, error);
    }
  }

  return NextResponse.json({
    checkedTrial: trialOwners.length,
    checkedCash: cashOwners.length,
    sent,
  });
}
