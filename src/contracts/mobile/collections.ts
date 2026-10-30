import { z } from "zod";

export const collectionsQuery = z.object({ standId: z.string().min(1) });
export type CollectionsQuery = z.infer<typeof collectionsQuery>;

export const collectionStatus = z.enum(["ORDERED", "READY", "COLLECTED"]);
export type CollectionStatus = z.infer<typeof collectionStatus>;

export const collectionOrder = z.object({
  id: z.string(),
  orderNumber: z.string(),
  customerName: z.string().nullable(),
  customerPhone: z.string().nullable(),
  status: collectionStatus.nullable(),
  fullyPaid: z.boolean(),
  balanceDueCents: z.number().int().nullable(),
  totalCents: z.number().int(),
  currency: z.string(),
  isDelivery: z.boolean(),
  address: z.string().nullable(),
  note: z.string().nullable(),
  subscriptionTitle: z.string().nullable(),
  items: z.array(z.object({ id: z.string(), name: z.string(), quantity: z.number().int() })),
});
export type CollectionOrder = z.infer<typeof collectionOrder>;

/** One pre-order page or subscription cycle, as on the web Pick Ups & Delivery page. */
export const collectionDay = z.object({
  key: z.string(),
  /** Pre-order page title, "Subscription · …", or the day when pages can't be matched. */
  title: z.string(),
  /** Pickup / delivery day and time. */
  label: z.string(),
  /** Delivery count per suburb. */
  deliveries: z.array(z.object({ name: z.string(), count: z.number().int() })),
  /** Orders with a customer email (for "Email customers"). */
  emailableCount: z.number().int(),
  windowClosed: z.boolean(),
  itemCount: z.number().int(),
  takenCents: z.number().int(),
  currency: z.string(),
  makeList: z.array(z.object({ name: z.string(), qty: z.number().int() })),
  orders: z.array(collectionOrder),
});
export type CollectionDay = z.infer<typeof collectionDay>;

export const collectionsResponse = z.object({ days: z.array(collectionDay) });
export type CollectionsResponse = z.infer<typeof collectionsResponse>;

export const collectionEmailBody = z.object({
  standId: z.string().min(1),
  groupKey: z.string().min(1),
  subject: z.string().trim().min(1, "Add a subject.").max(200),
  message: z.string().trim().min(1, "Write a message.").max(5000),
});
export type CollectionEmailBody = z.infer<typeof collectionEmailBody>;

export const collectionEmailResponse = z.object({ summary: z.string() });
export type CollectionEmailResponse = z.infer<typeof collectionEmailResponse>;

export const advanceCollectionResponse = z.object({ status: collectionStatus });
export type AdvanceCollectionResponse = z.infer<typeof advanceCollectionResponse>;
