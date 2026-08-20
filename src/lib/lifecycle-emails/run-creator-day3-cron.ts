import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";
import { sendCreatorDay3 } from "@/lib/lifecycle-emails/creator-intro";
import { daysAgo, markSent, recipient } from "@/lib/lifecycle-emails/cron-helpers";

/** Day 3 after signup: personal creator intro. Returns send counts. */
export async function runCreatorDay3Cron(now: Date): Promise<{
  checked: number;
  sent: number;
}> {
  const owners = await prisma.owner.findMany({
    where: {
      deletedAt: null,
      creatorDay3SentAt: null,
      createdAt: { lte: daysAgo(3, now) },
    },
    include: { user: { select: { email: true, name: true } } },
    take: 200,
  });

  let sent = 0;

  for (const owner of owners) {
    const r = recipient(owner);
    if (!r) continue;
    try {
      await sendCreatorDay3(r);
      await markSent(owner.id, "creatorDay3SentAt", now);
      sent += 1;
    } catch (error) {
      console.error(`[${APP_NAME}] creator day-3 email failed`, owner.id, error);
    }
  }

  return { checked: owners.length, sent };
}
