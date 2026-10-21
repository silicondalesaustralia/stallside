import type { MembershipPlan, ShopperInterval } from "@/lib/subscription-offer";

/** Everything a subscription or membership offer page shows; plain data so the editor can preview it. */
export type SubscriptionOfferData = {
  standSlug: string;
  standName: string;
  accentColor: string | null;
  isMembership: boolean;
  offer: {
    slug: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    currency: string;
    interval: ShopperInterval;
    priceCents: number;
    termWeeks: number | null;
    weeklyPriceCents: number | null;
    monthlyPriceCents: number | null;
    upfrontPriceCents: number | null;
    upfrontBenefitsText: string | null;
    termsText: string | null;
    collectionNote: string | null;
    handoverCollect: boolean;
    handoverDeliver: boolean;
  };
  collectionDayLabel: string | null;
  plans: { plan: MembershipPlan; priceCents: number }[];
  lines: { name: string; quantity: number; lineTotalCents: number }[];
  /** Spots left when the offer has a member limit; null when unlimited. */
  spotsLeft: number | null;
  /** Null when shoppers can sign up; otherwise why they can't, in shopper words. */
  unavailableReason: string | null;
};
