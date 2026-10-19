import { z } from "zod";

/** Upsell form values; the web form and the app both send this shape. */
export const upsellInput = z.object({
  name: z.string().trim().max(80),
  offerProductId: z.string(),
  /** Special price as typed, e.g. "4.50"; blank charges the normal price. */
  price: z.string().trim().max(12),
  isActive: z.boolean(),
  sitewide: z.boolean(),
  categoryIds: z.array(z.string().min(1)).max(500),
  productIds: z.array(z.string().min(1)).max(2000),
  showOnWebsite: z.boolean(),
  showAtStall: z.boolean(),
});
export type UpsellInputValues = z.infer<typeof upsellInput>;

export const EMPTY_UPSELL_INPUT: UpsellInputValues = {
  name: "",
  offerProductId: "",
  price: "",
  isActive: true,
  sitewide: true,
  categoryIds: [],
  productIds: [],
  showOnWebsite: true,
  showAtStall: true,
};

export const upsellsQuery = z.object({ standId: z.string().min(1) });

export const mobileUpsellRow = z.object({
  id: z.string(),
  name: z.string(),
  offer: z.string(),
  /** "sitewide, 2 categories" */
  scope: z.string(),
  /** "online store and stall" */
  channels: z.string(),
  isActive: z.boolean(),
});
export type MobileUpsellRow = z.infer<typeof mobileUpsellRow>;

const linked = z.object({ id: z.string(), name: z.string(), offers: z.string() });

export const upsellsResponse = z.object({
  upsells: z.array(mobileUpsellRow),
  /** Business default used when no upsell fits, e.g. "Jam ($4.00)"; null when none. */
  defaultUpsell: z.string().nullable(),
  /** e.g. "10% off first order"; null when off. */
  firstOrderDiscount: z.string().nullable(),
  /** Products that offer their own extra item. */
  productOverrides: z.array(linked),
  /** Pre-order pages with an add-on. */
  preOrderAddOns: z.array(linked),
});
export type UpsellsResponse = z.infer<typeof upsellsResponse>;

export const upsellOption = z.object({ id: z.string(), label: z.string() });
export type UpsellOption = z.infer<typeof upsellOption>;

export const upsellFormOptions = z.object({
  currency: z.string(),
  /** Products that can be offered (not hidden, not pre-order), label includes price. */
  offerProducts: z.array(upsellOption),
  categories: z.array(upsellOption),
  products: z.array(upsellOption),
});
export type UpsellFormOptions = z.infer<typeof upsellFormOptions>;

export const upsellDetail = z.object({ id: z.string(), standId: z.string(), input: upsellInput });
export type UpsellDetail = z.infer<typeof upsellDetail>;

export const createUpsellBody = z.object({ standId: z.string().min(1), input: upsellInput });
export const updateUpsellBody = z.object({ input: upsellInput });
export const upsellActiveBody = z.object({ isActive: z.boolean() });
export const upsellSaveResponse = z.object({ id: z.string() });
export type UpsellSaveResponse = z.infer<typeof upsellSaveResponse>;
