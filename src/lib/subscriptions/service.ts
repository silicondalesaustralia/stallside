import { revalidatePath } from "next/cache";
import { ShopperSubStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { countHoldingMembers } from "@/lib/subscription-capacity";

/** Subscribers who still pay or collect; an offer can't be deleted while it has any. */
const LIVE_STATUSES: ShopperSubStatus[] = [
  ShopperSubStatus.ACTIVE,
  ShopperSubStatus.PAST_DUE,
  ShopperSubStatus.PAUSED,
];

const offerInclude = {
  _count: { select: { items: true, subscriptions: true } },
  stand: { select: { slug: true } },
} as const;

async function withHolding<T extends { id: string }>(offer: T) {
  return { ...offer, holding: await countHoldingMembers(offer.id) };
}

/** Offers for one business, with how many spots are taken. */
export async function listOwnerOffers(ownerId: string, standId: string) {
  const offers = await prisma.subscriptionOffer.findMany({
    where: { standId, ownerId },
    orderBy: [{ title: "asc" }],
    include: offerInclude,
  });
  return Promise.all(offers.map(withHolding));
}
export type OwnerOffer = Awaited<ReturnType<typeof listOwnerOffers>>[number];

/** One offer plus its 50 newest subscribers. */
export async function getOwnerOffer(ownerId: string, offerId: string) {
  const offer = await prisma.subscriptionOffer.findFirst({
    where: { id: offerId, ownerId },
    include: offerInclude,
  });
  if (!offer) return null;
  const [withCount, subscriptions] = await Promise.all([
    withHolding(offer),
    prisma.shopperSubscription.findMany({
      where: { offerId: offer.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        customerId: true,
        status: true,
        nextCollectionAt: true,
      },
    }),
  ]);
  return { offer: withCount, subscriptions };
}
export type OwnerOfferDetail = NonNullable<Awaited<ReturnType<typeof getOwnerOffer>>>;

function revalidateOfferPaths(standId: string, standSlug: string, offerId: string, offerSlug: string) {
  revalidatePath("/dashboard/subscriptions");
  revalidatePath(`/dashboard/subscriptions/${offerId}`);
  revalidatePath(`/dashboard/businesses/${standId}`);
  revalidatePath(`/s/${standSlug}/sub`);
  revalidatePath(`/s/${standSlug}/sub/${offerSlug}`);
}

type Result = { ok: true } | { error: string };

export async function setOwnerOfferActive(ownerId: string, offerId: string, isActive: boolean): Promise<Result> {
  const offer = await prisma.subscriptionOffer.findFirst({
    where: { id: offerId, ownerId },
    include: { stand: { select: { slug: true } } },
  });
  if (!offer) return { error: "Subscription not found." };
  await prisma.subscriptionOffer.update({ where: { id: offer.id }, data: { isActive } });
  revalidateOfferPaths(offer.standId, offer.stand.slug, offer.id, offer.slug);
  return { ok: true };
}

export async function deleteOwnerOffer(ownerId: string, offerId: string): Promise<Result> {
  const offer = await prisma.subscriptionOffer.findFirst({
    where: { id: offerId, ownerId },
    include: { stand: { select: { slug: true } } },
  });
  if (!offer) return { error: "Subscription not found." };

  const liveCount = await prisma.shopperSubscription.count({
    where: { offerId: offer.id, status: { in: LIVE_STATUSES } },
  });
  if (liveCount > 0) {
    return {
      error: `Cannot delete while ${liveCount} subscriber${liveCount === 1 ? " is" : "s are"} still active. Turn the offer off first, or wait until they cancel.`,
    };
  }

  await prisma.subscriptionOffer.delete({ where: { id: offer.id } });
  revalidateOfferPaths(offer.standId, offer.stand.slug, offer.id, offer.slug);
  return { ok: true };
}
