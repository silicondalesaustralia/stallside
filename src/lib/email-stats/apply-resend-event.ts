import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type ResendWebhookPayload = {
  type?: string;
  created_at?: string;
  data?: {
    email_id?: string;
    bounce?: { type?: string; subType?: string };
  };
};

/** Higher rank wins for `lastEvent`, so a late "delivered" never hides a bounce or open. */
const EVENT_RANK: Record<string, number> = {
  sent: 1,
  delivery_delayed: 2,
  delivered: 3,
  opened: 4,
  clicked: 5,
  failed: 6,
  bounced: 7,
  complained: 8,
};

function eventUpdate(
  event: string,
  at: Date,
  payload: ResendWebhookPayload,
): Prisma.EmailSendLogUpdateManyMutationInput {
  switch (event) {
    case "delivered":
      return { deliveredAt: at };
    case "opened":
      return { openCount: { increment: 1 } };
    case "clicked":
      return { clickCount: { increment: 1 } };
    case "bounced":
      return { bouncedAt: at, bounceType: payload.data?.bounce?.type ?? null };
    case "complained":
      return { complainedAt: at };
    case "failed":
      return { status: "failed" };
    default:
      return {};
  }
}

async function isDuplicate(svixId: string, type: string, resendId: string) {
  try {
    await prisma.resendWebhookEvent.create({ data: { id: svixId, type, resendId } });
    return false;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return true;
    }
    throw error;
  }
}

/** Events can beat the send log write; ask Resend to retry briefly, then give up. */
const RETRY_WINDOW_MS = 10 * 60 * 1000;

export type ApplyResult = "applied" | "ignored" | "retry";

export async function applyResendEvent(
  svixId: string,
  payload: ResendWebhookPayload,
): Promise<ApplyResult> {
  const type = payload.type ?? "";
  const resendId = payload.data?.email_id;
  if (!type.startsWith("email.") || !resendId) return "ignored";

  const event = type.slice("email.".length);
  const at = payload.created_at ? new Date(payload.created_at) : new Date();
  const where = { resendId };

  if ((await prisma.emailSendLog.count({ where })) === 0) {
    return Date.now() - at.getTime() < RETRY_WINDOW_MS ? "retry" : "ignored";
  }
  if (await isDuplicate(svixId, type, resendId)) return "ignored";

  await prisma.emailSendLog.updateMany({ where, data: eventUpdate(event, at, payload) });
  if (event === "opened") {
    await prisma.emailSendLog.updateMany({
      where: { ...where, firstOpenedAt: null },
      data: { firstOpenedAt: at },
    });
  }
  if (event === "clicked") {
    await prisma.emailSendLog.updateMany({
      where: { ...where, firstClickedAt: null },
      data: { firstClickedAt: at },
    });
  }

  const rank = EVENT_RANK[event];
  if (!rank) return "applied";
  const lowerRanked = Object.keys(EVENT_RANK).filter((e) => EVENT_RANK[e] < rank);
  await prisma.emailSendLog.updateMany({
    where: { ...where, OR: [{ lastEvent: null }, { lastEvent: { in: lowerRanked } }] },
    data: { lastEvent: event },
  });
  return "applied";
}
