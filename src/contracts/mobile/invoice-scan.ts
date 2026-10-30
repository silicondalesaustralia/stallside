import { z } from "zod";
import { materialUnit } from "./material-units";

export const INVOICE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
/** Photos are shrunk on the server before scanning, so they can start larger. */
export const INVOICE_PHOTO_MAX_BYTES = 12 * 1024 * 1024;

export const invoiceReviewLine = z.object({
  key: z.string(),
  description: z.string(),
  include: z.boolean(),
  /** Existing material id, "new", or "" (unmatched). */
  materialId: z.string(),
  quantity: z.number(),
  unit: materialUnit,
  /** Cost in the invoice's current `costBasis`. */
  totalCents: z.number().int(),
  taxCents: z.number().int(),
  confidence: z.enum(["high", "medium", "low"]),
});
export type InvoiceReviewLine = z.infer<typeof invoiceReviewLine>;

export const invoiceReview = z.object({
  supplier: z.string(),
  invoiceNumber: z.string(),
  invoiceDate: z.string(),
  currency: z.string().nullable(),
  totalCents: z.number().int().nullable(),
  taxCents: z.number().int().nullable(),
  receiptUrl: z.string().nullable(),
  /** Date an invoice with this number was already recorded. */
  duplicateOf: z.string().nullable(),
  costBasis: z.enum(["ex-tax", "inc-tax"]),
  taxLabel: z.string(),
  taxRecoverable: z.boolean(),
  lines: z.array(invoiceReviewLine),
});
export type InvoiceReview = z.infer<typeof invoiceReview>;

export const invoiceScanResponse = z.object({
  invoice: invoiceReview,
  /** The owner's active materials, for matching lines. */
  materials: z.array(z.object({ id: z.string(), name: z.string(), baseUnit: materialUnit })),
  currency: z.string(),
});
export type InvoiceScanResponse = z.infer<typeof invoiceScanResponse>;

export const saveInvoiceBody = z.object({
  supplier: z.string().trim().max(120),
  invoiceNumber: z.string().trim().max(60),
  invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  receiptUrl: z.string().url().nullable(),
  lines: z
    .array(
      z.object({
        description: z.string().trim().min(1).max(200),
        materialId: z.string().min(1),
        newBaseUnit: materialUnit.optional(),
        quantity: z.number().positive(),
        unit: materialUnit,
        totalCents: z.number().int().min(0),
      }),
    )
    .min(1)
    .max(80),
});
export type SaveInvoiceBody = z.infer<typeof saveInvoiceBody>;
