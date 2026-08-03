import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";
import { SubscriptionStatus } from "@/generated/prisma/client";
import {
  sendProLapseDay23,
  sendProLapseDay45,
} from "@/lib/lifecycle-emails";
import { daysAgo, markSent, recipient } from "@/lib/lifecycle-emails/cron-helpers";

/** Day 23 / 45 after paid Pro → Starter. Returns send counts. */
export async function runProLapseCron(now: Date): Promise<{
  checked: number;
  day23: number;
  day45: number;
}> {
  const owners = await prisma.owner.findMany({
    where: {
      lifetimeAccess: false,
      proLapsedAt: { not: null },
      subscriptionPlan: { in: ["free", "starter", "cash"] },
      OR: [
        { stripeSubscriptionId: null },
        {
          subscriptionStatus: {
            in: [SubscriptionStatus.CANCELLED, SubscriptionStatus.NONE],
          },
        },
      ],
    },
    include: { user: { select: { email: true, name: true } } },
    take: 200,
  });

  let day23 = 0;
  let day45 = 0;

  for (const owner of owners) {
    const r = recipient(owner);
    if (!r || !owner.proLapsedAt) continue;
    try {
      if (!owner.proLapseDay23SentAt && owner.proLapsedAt <= daysAgo(23, now)) {
        await sendProLapseDay23(r);
        await markSent(owner.id, "proLapseDay23SentAt", now);
        day23 += 1;
      }
      if (!owner.proLapseDay45SentAt && owner.proLapsedAt <= daysAgo(45, now)) {
        const monthStart = daysAgo(30, now);
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
        await sendProLapseDay45(r, { cardInterestCount, restockCount });
        await markSent(owner.id, "proLapseDay45SentAt", now);
        day45 += 1;
      }
    } catch (error) {
      console.error(`[${APP_NAME}] Pro lapse lifecycle email failed`, owner.id, error);
    }
  }

  return { checked: owners.length, day23, day45 };
}
