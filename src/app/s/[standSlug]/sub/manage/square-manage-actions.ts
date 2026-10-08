"use server";

import { revalidatePath } from "next/cache";
import { OnlinePaymentProvider, ShopperSubStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { resumedBillingAt } from "@/lib/square-subscriptions/schedule";
import { updateSquareSubscriptionCard } from "@/lib/square-subscriptions/update-card";
import { subscriptionManagePath } from "@/lib/subscription-offer";

type Result = { ok: true; message: string } | { error: string };

async function loadSquareSub(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  if (!token) return null;
  const sub = await prisma.shopperSubscription.findUnique({
    where: { manageToken: token },
    include: { stand: { select: { slug: true } } },
  });
  return sub?.paymentProvider === OnlinePaymentProvider.SQUARE ? sub : null;
}

function refresh(slug: string, token: string) {
  revalidatePath(subscriptionManagePath(slug, token));
}

export async function resumeSquareSubscription(formData: FormData): Promise<Result> {
  try {
    const sub = await loadSquareSub(formData);
    if (!sub || sub.status !== ShopperSubStatus.PAUSED) return { error: "Nothing to resume." };
    await prisma.shopperSubscription.update({
      where: { id: sub.id },
      data: {
        status: sub.billingFailures > 0 ? ShopperSubStatus.PAST_DUE : ShopperSubStatus.ACTIVE,
        pausedAt: null,
        nextBillingAt: resumedBillingAt(sub.nextBillingAt, new Date()),
      },
    });
    refresh(sub.stand.slug, sub.manageToken);
    return { ok: true, message: "Subscription resumed." };
  } catch (error) {
    console.error("Resume Square subscription failed", error);
    return { error: "Could not resume. Try again." };
  }
}

/** Active: stop at the end of the paid period. Paused or overdue: stop now. */
export async function cancelSquareSubscription(formData: FormData): Promise<Result> {
  try {
    const sub = await loadSquareSub(formData);
    if (!sub || sub.status === ShopperSubStatus.CANCELLED || sub.status === ShopperSubStatus.INCOMPLETE) {
      return { error: "This subscription is not active." };
    }
    const atPeriodEnd = sub.status === ShopperSubStatus.ACTIVE && sub.nextBillingAt != null;
    await prisma.shopperSubscription.update({
      where: { id: sub.id },
      data: atPeriodEnd
        ? { cancelAtPeriodEnd: true }
        : {
            status: ShopperSubStatus.CANCELLED,
            nextBillingAt: null,
            billingRetryAt: null,
            nextCollectionAt: null,
          },
    });
    refresh(sub.stand.slug, sub.manageToken);
    return {
      ok: true,
      message: atPeriodEnd
        ? "Cancelled. You won't be charged again."
        : "Subscription cancelled.",
    };
  } catch (error) {
    console.error("Cancel Square subscription failed", error);
    return { error: "Could not cancel. Try again." };
  }
}

export async function undoCancelSquareSubscription(formData: FormData): Promise<Result> {
  try {
    const sub = await loadSquareSub(formData);
    if (!sub?.cancelAtPeriodEnd || sub.status === ShopperSubStatus.CANCELLED) {
      return { error: "Nothing to undo." };
    }
    await prisma.shopperSubscription.update({
      where: { id: sub.id },
      data: { cancelAtPeriodEnd: false },
    });
    refresh(sub.stand.slug, sub.manageToken);
    return { ok: true, message: "Your subscription will continue." };
  } catch (error) {
    console.error("Undo Square cancel failed", error);
    return { error: "Could not undo. Try again." };
  }
}

export async function updateSquareCardAction(input: {
  manageToken: string;
  sourceId: string;
}): Promise<Result> {
  try {
    if (!input.manageToken || !input.sourceId) return { error: "Card details are missing." };
    return await updateSquareSubscriptionCard(input);
  } catch (error) {
    console.error("Update Square card failed", error);
    return { error: "Could not update the card. Try again." };
  }
}
