import { APP_NAME } from "@/lib/constants";
import { ensureStandsHaveStarterPaymentMethod } from "@/lib/ensure-stand-payment-fallback";
import {
  classifyAdminBillingEvent,
  notifyAdminBillingEvent,
  type AdminBillingKind,
} from "@/lib/notify-admin-billing";
import { normalizeSubscriptionPlan } from "@/lib/owner-trial";
import type { SubscriptionStatus } from "@/generated/prisma/client";

type SyncOwner = {
  id: string;
  businessName: string;
  contactEmail: string;
  subscriptionPlan: string | null;
  subscriptionStatus: SubscriptionStatus;
  cancelAtPeriodEnd: boolean;
  subscriptionStartedAt: Date | null;
  user?: { email: string | null; name: string | null } | null;
};

export function adminKindForSubscriptionSync(input: {
  owner: SyncOwner;
  live: boolean;
  isPro: boolean;
  cancelled: boolean;
  newlySchedulingCancel: boolean;
  downgradeToStarter: boolean;
  cancelAtPeriodEnd: boolean;
}): AdminBillingKind | null {
  return classifyAdminBillingEvent({
    priorPlan: input.owner.subscriptionPlan,
    priorStatus: input.owner.subscriptionStatus,
    priorCancelAtPeriodEnd: input.owner.cancelAtPeriodEnd,
    priorSubscriptionStartedAt: input.owner.subscriptionStartedAt,
    live: input.live,
    isPro: input.isPro,
    cancelled: input.cancelled,
    newlySchedulingCancel: input.newlySchedulingCancel,
    downgradeToStarter: input.downgradeToStarter,
    cancelAtPeriodEnd: input.cancelAtPeriodEnd,
  });
}

export async function notifyAdminAfterSubscriptionSync(input: {
  kind: AdminBillingKind;
  owner: SyncOwner;
  planAfter: string;
  statusAfter: SubscriptionStatus;
  monthlyFeeCents: number;
  currency: string;
  periodEndsAt: Date | null;
  stripeSubscriptionId: string;
}) {
  try {
    await notifyAdminBillingEvent({
      kind: input.kind,
      ownerId: input.owner.id,
      name: input.owner.user?.name || input.owner.businessName,
      email: input.owner.user?.email || input.owner.contactEmail || "",
      planBefore: normalizeSubscriptionPlan(input.owner.subscriptionPlan),
      planAfter: input.planAfter,
      status: input.statusAfter,
      monthlyFeeCents: input.monthlyFeeCents,
      currency: input.currency,
      periodEndsAt: input.periodEndsAt,
      stripeSubscriptionId: input.stripeSubscriptionId,
    });
  } catch (error) {
    console.error(
      `[${APP_NAME}] admin billing notify failed`,
      input.owner.id,
      error,
    );
  }
}

export async function sendCustomerSubscriptionEmails(input: {
  ownerId: string;
  live: boolean;
  cancelled: boolean;
  isPro: boolean;
  downgradeToStarter: boolean;
  newlySchedulingCancel: boolean;
}) {
  if (input.live && !input.cancelled && input.isPro) {
    const { sendAndMarkCardWelcome } = await import(
      "@/lib/lifecycle-emails/send-and-mark"
    );
    await sendAndMarkCardWelcome(input.ownerId);
  }

  if (input.downgradeToStarter) {
    await ensureStandsHaveStarterPaymentMethod(input.ownerId);
  } else if (input.cancelled || input.newlySchedulingCancel) {
    const { sendAndMarkCancelFeedback } = await import(
      "@/lib/lifecycle-emails/send-and-mark"
    );
    await sendAndMarkCancelFeedback(input.ownerId);
  }
}
