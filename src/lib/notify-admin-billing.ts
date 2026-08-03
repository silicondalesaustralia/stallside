import { APP_NAME } from "@/lib/constants";
import { appBaseUrl } from "@/lib/app-url";
import { escapeHtml } from "@/lib/lifecycle-emails/html";
import { contactInbox, sendOwnerEmail } from "@/lib/notify-email";
import { normalizeSubscriptionPlan } from "@/lib/owner-trial";
import { SubscriptionStatus } from "@/generated/prisma/client";

export type AdminBillingKind =
  | "paid_subscribe"
  | "cancel_scheduled"
  | "cancel_reversed"
  | "cancelled"
  | "downgraded_starter";

const TITLES: Record<AdminBillingKind, string> = {
  paid_subscribe: "Paid Pro subscribe",
  cancel_scheduled: "Cancel scheduled",
  cancel_reversed: "Cancel reversed",
  cancelled: "Subscription cancelled",
  downgraded_starter: "Downgraded to Free",
};

/** Meaningful billing transition for admin mail (null = no email). */
export function classifyAdminBillingEvent(input: {
  priorPlan: string | null | undefined;
  priorStatus: SubscriptionStatus;
  priorCancelAtPeriodEnd: boolean;
  priorSubscriptionStartedAt: Date | null;
  live: boolean;
  isPro: boolean;
  cancelled: boolean;
  newlySchedulingCancel: boolean;
  downgradeToStarter: boolean;
  cancelAtPeriodEnd: boolean;
}): AdminBillingKind | null {
  const priorWasPro = normalizeSubscriptionPlan(input.priorPlan) === "pro";
  const priorPaidLive =
    priorWasPro &&
    (input.priorStatus === SubscriptionStatus.ACTIVE ||
      input.priorStatus === SubscriptionStatus.TRIALING);

  if (input.downgradeToStarter) {
    if (
      normalizeSubscriptionPlan(input.priorPlan) === "free" &&
      input.priorStatus === SubscriptionStatus.CANCELLED
    ) {
      return null;
    }
    return "downgraded_starter";
  }

  if (input.newlySchedulingCancel) return "cancel_scheduled";

  const newlyUncancelling =
    !input.cancelled &&
    !input.cancelAtPeriodEnd &&
    input.priorCancelAtPeriodEnd;
  if (newlyUncancelling && input.live && input.isPro) {
    return "cancel_reversed";
  }

  if (input.cancelled) {
    if (input.priorStatus === SubscriptionStatus.CANCELLED) return null;
    return "cancelled";
  }

  if (
    input.live &&
    input.isPro &&
    (!priorPaidLive || !input.priorSubscriptionStartedAt)
  ) {
    return "paid_subscribe";
  }

  return null;
}

export async function notifyAdminBillingEvent(input: {
  kind: AdminBillingKind;
  ownerId: string;
  name: string;
  email: string;
  planBefore: string;
  planAfter: string;
  status: string;
  monthlyFeeCents: number;
  currency: string;
  periodEndsAt: Date | null;
  stripeSubscriptionId: string;
}) {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim() || "-";
  const title = TITLES[input.kind];
  const fee =
    input.monthlyFeeCents > 0
      ? `${(input.monthlyFeeCents / 100).toFixed(2)} ${input.currency}`
      : "-";
  const period = input.periodEndsAt
    ? input.periodEndsAt.toISOString()
    : "-";
  const adminUrl = `${appBaseUrl()}/admin/owners/${input.ownerId}`;

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#182C1B">
      <p style="font-size:18px;font-weight:600">${escapeHtml(title)}</p>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email || "-")}</p>
      <p><strong>Plan:</strong> ${escapeHtml(input.planBefore)} → ${escapeHtml(input.planAfter)}</p>
      <p><strong>Status:</strong> ${escapeHtml(input.status)}</p>
      <p><strong>Fee:</strong> ${escapeHtml(fee)}</p>
      <p><strong>Period ends:</strong> ${escapeHtml(period)}</p>
      <p style="margin:24px 0">
        <a href="${adminUrl}"
           style="background:#2E7D3F;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600;display:inline-block">
          Open in admin
        </a>
      </p>
      <p style="font-size:13px;color:#5a6b5c">
        Subscription: ${escapeHtml(input.stripeSubscriptionId)}
      </p>
    </div>
  `;

  await sendOwnerEmail(
    contactInbox(),
    `[${APP_NAME}] - ${title}`,
    html,
    {
      replyTo: email.includes("@") ? email : undefined,
      kind: `admin_billing_${input.kind}`,
    },
  );
}
