import { z } from "zod";

export const FULFILMENT_CHOICES = ["PICKUP", "DELIVERY", "BOTH"] as const;
export const SHIPPING_MODES = ["FREE", "FLAT", "CUSTOM"] as const;

export const shippingQuery = z.object({ standId: z.string().min(1) });

/** Shipping settings as form values; amounts are typed dollars, e.g. "9.95". */
export const shippingSettings = z.object({
  fulfilmentDefault: z.enum(FULFILMENT_CHOICES),
  shippingMode: z.enum(SHIPPING_MODES),
  flat: z.string().trim().max(12),
  freeOver: z.string().trim().max(12),
});
export type ShippingSettingsValues = z.infer<typeof shippingSettings>;

export const shippingResponse = z.object({ currency: z.string(), settings: shippingSettings });
export type ShippingResponse = z.infer<typeof shippingResponse>;

export const saveShippingBody = z.object({ standId: z.string().min(1), settings: shippingSettings });
