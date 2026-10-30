import { prisma } from "@/lib/prisma";

export type CollectionSubscriptionOfferRef = {
  id: string;
  title: string;
};

export async function loadStandSubscriptionOffers(
  ownerId: string,
  standId: string,
): Promise<CollectionSubscriptionOfferRef[]> {
  const offers = await prisma.subscriptionOffer.findMany({
    where: { ownerId, standId },
    orderBy: [{ title: "asc" }],
    select: { id: true, title: true },
  });
  return offers.map((o) => ({ id: o.id, title: o.title }));
}
