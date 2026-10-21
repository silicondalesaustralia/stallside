import { prisma } from "@/lib/prisma";
import { publicStandBranding } from "@/lib/public-stand-branding";
import { membershipOfferReady } from "@/lib/subscription-offer";
import type { PreOrderListData, SubscriptionListData } from "./offer-list-types";

async function loadStand(standId: string) {
  return prisma.stand.findUnique({ where: { id: standId }, include: { owner: true } });
}

/** Pre-order pages still taking orders, soonest collection first; null when the stand is gone. */
export async function loadPreOrderList(standId: string, pageHrefBase: string | null): Promise<PreOrderListData | null> {
  const stand = await loadStand(standId);
  if (!stand?.isActive) return null;
  const pages = await prisma.preOrderPage.findMany({
    where: { standId, isActive: true, orderByAt: { gte: new Date() } },
    orderBy: { collectionAt: "asc" },
    select: {
      slug: true,
      title: true,
      collectionAt: true,
      orderByAt: true,
      description: true,
      imageUrl: true,
      handoverMode: true,
      items: { orderBy: { sortOrder: "asc" }, take: 1, select: { product: { select: { imageUrl: true } } } },
    },
  });
  return {
    standSlug: stand.slug,
    standName: stand.name,
    timezone: stand.timezone,
    accentColor: publicStandBranding(stand, stand.owner).accentColor ?? null,
    pageHrefBase,
    pages: pages.map((page) => ({
      slug: page.slug,
      title: page.title,
      description: page.description,
      imageUrl: page.imageUrl,
      collectionAt: page.collectionAt.toISOString(),
      orderByAt: page.orderByAt.toISOString(),
      handoverMode: page.handoverMode,
      fallbackImageUrl: page.items[0]?.product.imageUrl ?? null,
    })),
  };
}

/** Offers ready for sign-up, for the subscriptions list; null when the stand is gone. */
export async function loadSubscriptionList(
  standId: string,
  offerHrefBase: string | null,
): Promise<SubscriptionListData | null> {
  const stand = await loadStand(standId);
  if (!stand?.isActive) return null;
  const offers = await prisma.subscriptionOffer.findMany({
    where: { standId, isActive: true },
    orderBy: { title: "asc" },
    select: {
      slug: true,
      title: true,
      description: true,
      imageUrl: true,
      currency: true,
      termWeeks: true,
      weeklyPriceCents: true,
      monthlyPriceCents: true,
      upfrontPriceCents: true,
      stripePriceId: true,
      stripeWeeklyPriceId: true,
      stripeMonthlyPriceId: true,
      stripeUpfrontPriceId: true,
      kind: true,
      interval: true,
      priceCents: true,
    },
  });
  return {
    standSlug: stand.slug,
    standName: stand.name,
    accentColor: publicStandBranding(stand, stand.owner).accentColor ?? null,
    offerHrefBase,
    offers: offers.filter((o) => membershipOfferReady(o)).map((o) => ({
      slug: o.slug,
      title: o.title,
      description: o.description,
      imageUrl: o.imageUrl,
      currency: o.currency,
      termWeeks: o.termWeeks,
      weeklyPriceCents: o.weeklyPriceCents,
      monthlyPriceCents: o.monthlyPriceCents,
      upfrontPriceCents: o.upfrontPriceCents,
    })),
  };
}
