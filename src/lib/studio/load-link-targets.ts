import { prisma } from "@/lib/prisma";

export type OfferLinkTarget = { slug: string; title: string; kind: "BOX" | "MEMBERSHIP" };
export type PreOrderLinkTarget = { slug: string; title: string };

/** Active subscription, membership and pre-order pages a menu or button can link to. */
export async function loadLinkTargets(standId: string): Promise<{
  offerPages: OfferLinkTarget[];
  preOrderPages: PreOrderLinkTarget[];
}> {
  try {
    const [offers, preOrders] = await Promise.all([
      prisma.subscriptionOffer.findMany({
        where: { standId, isActive: true },
        select: { slug: true, title: true, kind: true },
        orderBy: { title: "asc" },
      }),
      prisma.preOrderPage.findMany({
        where: { standId, isActive: true },
        select: { slug: true, title: true },
        orderBy: { title: "asc" },
      }),
    ]);
    return { offerPages: offers, preOrderPages: preOrders };
  } catch (err) {
    console.error("[studio metadata] link targets", err);
    return { offerPages: [], preOrderPages: [] };
  }
}
