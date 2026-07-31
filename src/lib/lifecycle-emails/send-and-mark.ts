import { prisma } from "@/lib/prisma";
import { COUNTED_STATUSES } from "@/lib/order-metrics";
import {
  sendCardWelcome,
  sendCancellationFeedback,
  sendFirstTenOrdersEmail,
  sendProLapseDay0,
  sendTrialWelcome,
} from "@/lib/lifecycle-emails";
import { APP_NAME } from "@/lib/constants";

function recipientEmail(owner: {
  contactEmail: string;
  user?: { email: string | null } | null;
}): string | null {
  const email = (owner.user?.email || owner.contactEmail || "").trim();
  return email.includes("@") ? email : null;
}

export async function sendAndMarkTrialWelcome(ownerId: string) {
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
    include: { user: { select: { email: true, name: true } } },
  });
  if (!owner || owner.trialWelcomeSentAt) return;
  const to = recipientEmail(owner);
  if (!to) return;

  try {
    await sendTrialWelcome({
      to,
      name: owner.user?.name || owner.businessName,
    });
    await prisma.owner.update({
      where: { id: ownerId },
      data: { trialWelcomeSentAt: new Date() },
    });
  } catch (error) {
    console.error(`[${APP_NAME}] trial welcome failed`, ownerId, error);
  }
}

/** Pro welcome after paid subscribe (cardWelcomeSentAt). */
export async function sendAndMarkCardWelcome(ownerId: string) {
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
    include: { user: { select: { email: true, name: true } } },
  });
  if (!owner || owner.cardWelcomeSentAt) return;
  const to = recipientEmail(owner);
  if (!to) return;

  try {
    await sendCardWelcome({
      to,
      name: owner.user?.name || owner.businessName,
    });
    await prisma.owner.update({
      where: { id: ownerId },
      data: { cardWelcomeSentAt: new Date() },
    });
  } catch (error) {
    console.error(`[${APP_NAME}] Pro welcome failed`, ownerId, error);
  }
}

/** Day-0 Pro lapse → Starter (once per lapse). */
export async function sendAndMarkProLapseDay0(ownerId: string) {
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
    include: { user: { select: { email: true, name: true } } },
  });
  if (!owner || owner.proLapseDay0SentAt) return;
  if (owner.lifetimeAccess) return;
  const to = recipientEmail(owner);
  if (!to) return;

  const now = new Date();
  try {
    await sendProLapseDay0({
      to,
      name: owner.user?.name || owner.businessName,
      businessName: owner.businessName,
    });
    await prisma.owner.update({
      where: { id: ownerId },
      data: {
        proLapseDay0SentAt: now,
        proLapsedAt: owner.proLapsedAt ?? now,
      },
    });
  } catch (error) {
    console.error(`[${APP_NAME}] Pro lapse day-0 email failed`, ownerId, error);
  }
}

/** Cancel-at-period-end feedback (skipped for lifetime). */
export async function sendAndMarkCancelFeedback(ownerId: string) {
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
    include: { user: { select: { email: true, name: true } } },
  });
  if (!owner || owner.cancelFeedbackSentAt) return;
  if (owner.lifetimeAccess) return;
  const to = recipientEmail(owner);
  if (!to) return;

  try {
    await sendCancellationFeedback({
      to,
      name: owner.user?.name || owner.businessName,
    });
    await prisma.owner.update({
      where: { id: ownerId },
      data: { cancelFeedbackSentAt: new Date() },
    });
  } catch (error) {
    console.error(`[${APP_NAME}] cancel feedback email failed`, ownerId, error);
  }
}

export async function maybeSendFirstTenOrdersEmail(ownerId: string) {
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
    include: { user: { select: { email: true, name: true } } },
  });
  if (!owner || owner.firstTenOrdersEmailSentAt) return;

  const count = await prisma.order.count({
    where: { ownerId, paymentStatus: { in: COUNTED_STATUSES } },
  });
  if (count < 10) return;

  const to = recipientEmail(owner);
  if (!to) return;

  try {
    await sendFirstTenOrdersEmail({
      to,
      name: owner.user?.name || owner.businessName,
    });
    await prisma.owner.update({
      where: { id: ownerId },
      data: { firstTenOrdersEmailSentAt: new Date() },
    });
  } catch (error) {
    console.error(`[${APP_NAME}] 10-order email failed`, ownerId, error);
  }
}
