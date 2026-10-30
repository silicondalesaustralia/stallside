import { z } from "zod";
import { materialUnit } from "./material-units";

export const materialsQuery = z.object({ standId: z.string().min(1) });

export const materialStatus = z.enum(["in_stock", "reorder", "out", "archived"]);
export type MaterialStatus = z.infer<typeof materialStatus>;

export const mobileMaterial = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.enum(["INGREDIENT", "PACKAGING"]),
  baseUnit: materialUnit,
  status: materialStatus,
  /** e.g. "2.5 kg". */
  onHandLabel: z.string(),
  /** e.g. "$1.85 / kg", or "No price". */
  costLabel: z.string(),
  supplier: z.string().nullable(),
  sku: z.string().nullable(),
});
export type MobileMaterial = z.infer<typeof mobileMaterial>;

export const materialsResponse = z.object({
  currency: z.string(),
  /** Today in the business's time zone, YYYY-MM-DD. */
  today: z.string(),
  materials: z.array(mobileMaterial),
});
export type MaterialsResponse = z.infer<typeof materialsResponse>;

export const mobilePurchase = z.object({
  id: z.string(),
  receivedOn: z.string(),
  quantityLabel: z.string(),
  totalCents: z.number().int(),
  supplier: z.string().nullable(),
  lotCode: z.string().nullable(),
  expiresOn: z.string().nullable(),
  invoiceNumber: z.string().nullable(),
  receiptUrl: z.string().nullable(),
});
export type MobilePurchase = z.infer<typeof mobilePurchase>;

export const materialDetailResponse = z.object({
  currency: z.string(),
  today: z.string(),
  material: mobileMaterial.extend({
    reorderLabel: z.string().nullable(),
    /** e.g. "1 kg for $4.50". */
    packLabel: z.string(),
    notes: z.string().nullable(),
  }),
  purchases: z.array(mobilePurchase),
  usedIn: z.array(z.object({ id: z.string(), name: z.string() })),
});
export type MaterialDetailResponse = z.infer<typeof materialDetailResponse>;

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.");

export const purchaseBody = z.object({
  ingredientId: z.string().min(1),
  quantity: z.number().positive(),
  unit: materialUnit,
  totalCents: z.number().int().min(0),
  supplier: z.string().trim().max(120).nullable(),
  lotCode: z.string().trim().max(60).nullable(),
  expiresOn: day.nullable(),
  notes: z.string().trim().max(1000).nullable(),
  receivedOn: day.nullable(),
});
export type PurchaseBody = z.infer<typeof purchaseBody>;

export const materialsMessage = z.object({ message: z.string() });
export type MaterialsMessage = z.infer<typeof materialsMessage>;
