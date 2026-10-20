import { z } from "zod";

export const suppliersQuery = z.object({ standId: z.string().min(1) });

const memberStatus = z.enum(["INVITED", "ACTIVE", "REVOKED"]);

export const mobileSupplierRow = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  status: memberStatus,
  productCount: z.number().int(),
});
export type MobileSupplierRow = z.infer<typeof mobileSupplierRow>;

export const suppliersResponse = z.object({ suppliers: z.array(mobileSupplierRow) });
export type SuppliersResponse = z.infer<typeof suppliersResponse>;

export const mobileSupplierProduct = z.object({
  id: z.string(),
  name: z.string(),
  /** Shared from the owner's catalogue rather than the supplier's own product. */
  linked: z.boolean(),
  unitsAdded: z.number().int(),
  unitsSold: z.number().int(),
  stockQuantity: z.number().int(),
  pendingUnits: z.number().int(),
  /** Supplier's own product not yet on the stall. */
  notListed: z.boolean(),
});
export type MobileSupplierProduct = z.infer<typeof mobileSupplierProduct>;

export const supplierDetailResponse = z.object({
  supplier: mobileSupplierRow,
  standName: z.string(),
  currency: z.string(),
  unitsAdded: z.number().int(),
  unitsSold: z.number().int(),
  onHand: z.number().int(),
  owedCents: z.number().int(),
  paidCents: z.number().int(),
  /** Stock the supplier added that waits for the owner to approve. */
  pendingLots: z.array(z.object({ id: z.string(), label: z.string() })),
  products: z.array(mobileSupplierProduct),
});
export type SupplierDetailResponse = z.infer<typeof supplierDetailResponse>;

export const inviteSupplierBody = z.object({
  standId: z.string().min(1),
  name: z.string().max(80),
  email: z.string().max(200),
});
export const supplierPayoutBody = z.object({ amount: z.string().max(12), note: z.string().max(200) });
export const approveLotBody = z.object({ lotId: z.string().min(1) });
