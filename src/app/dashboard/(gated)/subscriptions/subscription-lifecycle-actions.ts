"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ShopperSubStatus } from "@/generated/prisma/client";

const LIVE_STATUSES: ShopperSubStatus[] = [
  ShopperSubStatus.ACTIVE,
  ShopperSubStatus.PAST_DUE,
  ShopperSubStatus.PAUSED,
];

async function ownedOffer(offerId: string, ownerId: string) {
  return prisma.subscriptionOffer.findFirst({
    where: { id: offerId, ownerId },
    include: { stand: { select: { id: true, slug: true } } },
  });
}

function revalidateOfferPaths(standId: string, standSlug: string, offerId: string) {
  revalidatePath("/dashboard/subscriptions");
  revalidatePath(`/dashboard/subscriptions/${offerId}`);
  revalidatePath(`/dashboard/businesses/${standId}`);
  revalidatePath(`/s/${standSlug}/sub`);
}

export async function setSubscriptionOfferActive(
  offerId: string,
  isActive: boolean,
) {
  const { owner } = await requireOwnerWrite();
  const offer = await ownedOffer(offerId, owner.id);
  if (!offer) return { error: "Subscription not found." };

  await prisma.subscriptionOffer.update({
    where: { id: offer.id },
    data: { isActive },
  });

  revalidateOfferPaths(offer.standId, offer.stand.slug, offer.id);
  revalidatePath(`/s/${offer.stand.slug}/sub/${offer.slug}`);
  return { ok: true as const };
}

export async function deleteSubscriptionOffer(offerId: string) {
  const { owner } = await requireOwnerWrite();
  const offer = await ownedOffer(offerId, owner.id);
  if (!offer) return { error: "Subscription not found." };

  const liveCount = await prisma.shopperSubscription.count({
    where: { offerId: offer.id, status: { in: LIVE_STATUSES } },
  });
  if (liveCount > 0) {
    return {
      error: `Cannot delete while ${liveCount} subscriber${liveCount === 1 ? " is" : "s are"} still active. Turn the offer off first, or wait until they cancel.`,
    };
  }

  const standId = offer.standId;
  const standSlug = offer.stand.slug;

  await prisma.subscriptionOffer.delete({ where: { id: offer.id } });

  revalidateOfferPaths(standId, standSlug, offerId);
  revalidatePath(`/s/${standSlug}/sub`);
  redirect("/dashboard/subscriptions");
}
