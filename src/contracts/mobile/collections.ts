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

export const collectionDay = z.object({
  key: z.string(),
  label: z.string(),
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

export const advanceCollectionResponse = z.object({ status: collectionStatus });
export type AdvanceCollectionResponse = z.infer<typeof advanceCollectionResponse>;
