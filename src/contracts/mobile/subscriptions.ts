import { z } from "zod";

export const subscriptionsQuery = z.object({ standId: z.string().min(1) });

export const mobileOffer = z.object({
  id: z.string(),
  title: z.string(),
  kind: z.enum(["BOX", "MEMBERSHIP"]),
  isActive: z.boolean(),
  /** "Weekly", "12 weeks", … */
  cadence: z.string(),
  /** Lowest price a customer can pick. */
  priceCents: z.number().int(),
  currency: z.string(),
  productCount: z.number().int(),
  members: z.number().int(),
  maxMembers: z.number().int().nullable(),
  full: z.boolean(),
  needsSync: z.boolean(),
  url: z.string(),
});
export type MobileOffer = z.infer<typeof mobileOffer>;

export const offersResponse = z.object({ offers: z.array(mobileOffer) });
export type OffersResponse = z.infer<typeof offersResponse>;

export const MOBILE_SUBSCRIBER_STATUSES = ["INCOMPLETE", "ACTIVE", "PAST_DUE", "PAUSED", "CANCELLED"] as const;

export const mobileSubscriber = z.object({
  id: z.string(),
  customerName: z.string(),
  customerEmail: z.string(),
  customerPhone: z.string().nullable(),
  customerId: z.string().nullable(),
  status: z.enum(MOBILE_SUBSCRIBER_STATUSES),
  nextCollectionAt: z.string().nullable(),
});
export type MobileSubscriber = z.infer<typeof mobileSubscriber>;

export const offerDetailResponse = z.object({ offer: mobileOffer, subscribers: z.array(mobileSubscriber) });
export type OfferDetailResponse = z.infer<typeof offerDetailResponse>;

export const offerActiveBody = z.object({ isActive: z.boolean() });
