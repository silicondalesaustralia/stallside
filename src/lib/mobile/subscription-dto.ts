import type { MobileOffer, MobileSubscriber } from "@/contracts/mobile/subscriptions";
import type { OwnerOffer, OwnerOfferDetail } from "@/lib/subscriptions/service";
import { isOfferAtCapacity } from "@/lib/subscription-capacity";
import {
  intervalLabel,
  membershipOfferReady,
  offerDisplayPriceCents,
  subscriptionOfferUrl,
} from "@/lib/subscription-offer";

export function toMobileOffer(offer: OwnerOffer): MobileOffer {
  const membership = offer.kind === "MEMBERSHIP";
  return {
    id: offer.id,
    title: offer.title,
    kind: offer.kind,
    isActive: offer.isActive,
    cadence: membership ? `${offer.termWeeks ?? "?"} weeks` : intervalLabel(offer.interval),
    priceCents: offerDisplayPriceCents(offer),
    currency: offer.currency,
    productCount: offer._count.items,
    members: offer.holding,
    maxMembers: offer.maxMembers,
    full: isOfferAtCapacity(offer.maxMembers, offer.holding),
    needsSync: !membershipOfferReady(offer),
    url: subscriptionOfferUrl(offer.stand.slug, offer.slug),
  };
}

export function toMobileSubscriber(sub: OwnerOfferDetail["subscriptions"][number]): MobileSubscriber {
  return {
    id: sub.id,
    customerName: sub.customerName,
    customerEmail: sub.customerEmail,
    customerPhone: sub.customerPhone,
    customerId: sub.customerId,
    status: sub.status,
    nextCollectionAt: sub.nextCollectionAt?.toISOString() ?? null,
  };
}
