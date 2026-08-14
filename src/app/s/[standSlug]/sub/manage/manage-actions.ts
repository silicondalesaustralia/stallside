"use server";

import { redirect } from "next/navigation";
import { ShopperSubStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { appBaseUrl } from "@/lib/stripe";
import {
  createShopperBillingPortalSession,
  pauseShopperStripeSubscription,
  resumeShopperStripeSubscription,
} from "@/lib/shopper-subscription-stripe";
import { subscriptionManagePath } from "@/lib/subscription-offer";

async function loadManagedSub(token: string) {
  return prisma.shopperSubscription.findUnique({
    where: { manageToken: token },
    include: {
      stand: { select: { slug: true } },
      owner: {
        select: {
          stripeAccountId: true,
          stripeChargesEnabled: true,
        },
      },
    },
  });
}

export async function skipNextShopperCycle(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const sub = await loadManagedSub(token);
  if (!sub) return { error: "Subscription not found." };
  if (
    sub.status !== ShopperSubStatus.ACTIVE &&
    sub.status !== ShopperSubStatus.PAST_DUE
  ) {
    return { error: "Only active subscriptions can skip a cycle." };
  }
  await prisma.shopperSubscription.update({
    where: { id: sub.id },
    data: { skipNextCycle: true },
  });
  return { ok: true as const, message: "Next cycle will be skipped." };
}

export async function pauseShopperSubscription(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const sub = await loadManagedSub(token);
  if (!sub?.stripeSubscriptionId || !sub.owner.stripeAccountId) {
    return { error: "Subscription not found." };
  }
  try {
    await pauseShopperStripeSubscription({
      stripeAccountId: sub.owner.stripeAccountId,
      stripeSubscriptionId: sub.stripeSubscriptionId,
    });
    await prisma.shopperSubscription.update({
      where: { id: sub.id },
      data: {
        status: ShopperSubStatus.PAUSED,
        pausedAt: new Date(),
      },
    });
    return { ok: true as const, message: "Subscription paused." };
  } catch (error) {
    console.error("Pause shopper sub failed", error);
    return { error: "Could not pause. Try again." };
  }
}

export async function resumeShopperSubscription(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const sub = await loadManagedSub(token);
  if (!sub?.stripeSubscriptionId || !sub.owner.stripeAccountId) {
    return { error: "Subscription not found." };
  }
  try {
    await resumeShopperStripeSubscription({
      stripeAccountId: sub.owner.stripeAccountId,
      stripeSubscriptionId: sub.stripeSubscriptionId,
    });
    await prisma.shopperSubscription.update({
      where: { id: sub.id },
      data: {
        status: ShopperSubStatus.ACTIVE,
        pausedAt: null,
      },
    });
    return { ok: true as const, message: "Subscription resumed." };
  } catch (error) {
    console.error("Resume shopper sub failed", error);
    return { error: "Could not resume. Try again." };
  }
}

export async function openShopperBillingPortal(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const sub = await loadManagedSub(token);
  if (
    !sub?.stripeCustomerId ||
    !sub.owner.stripeAccountId ||
    !sub.owner.stripeChargesEnabled
  ) {
    return { error: "Billing portal is not available." };
  }
  const returnUrl = `${appBaseUrl()}${subscriptionManagePath(sub.stand.slug, token)}`;
  try {
    const session = await createShopperBillingPortalSession({
      stripeAccountId: sub.owner.stripeAccountId,
      stripeCustomerId: sub.stripeCustomerId,
      returnUrl,
    });
    redirect(session.url);
  } catch (error) {
    console.error("Shopper portal failed", error);
    return { error: "Could not open billing portal." };
  }
}
