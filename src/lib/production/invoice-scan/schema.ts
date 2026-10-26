import { z } from "zod";
import { MEASURE_UNITS } from "../unit-convert";

const money = z.number().nullable().catch(null);

export const scannedLineSchema = z.object({
  description: z.string().trim().min(1).max(200),
  packCount: z.number().positive().catch(1),
  packSize: z.number().positive().nullable().catch(null),
  packUnit: z.enum(MEASURE_UNITS).nullable().catch(null),
  lineTotal: z.number(),
  lineTax: money,
  taxable: z.boolean().nullable().catch(null),
  isMaterial: z.boolean().catch(true),
  confidence: z.enum(["high", "medium", "low"]).catch("medium"),
});

export const scannedInvoiceSchema = z.object({
  isInvoice: z.boolean().catch(true),
  supplier: z.string().trim().max(120).nullable().catch(null),
  invoiceNumber: z.string().trim().max(60).nullable().catch(null),
  invoiceDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .catch(null),
  currency: z.string().length(3).nullable().catch(null),
  pricesIncludeTax: z.boolean().nullable().catch(null),
  subtotal: money,
  tax: money,
  total: money,
  lines: z.array(z.unknown()).max(80).catch([]),
});

export type ScannedLine = z.infer<typeof scannedLineSchema>;
export type ScannedInvoice = z.infer<typeof scannedInvoiceSchema>;

/** What the review screen needs per line. */
export type ReviewLine = {
  key: string;
  description: string;
  include: boolean;
  /** Existing material id, "new", or "" (unmatched). */
  materialId: string;
  quantity: number;
  unit: (typeof MEASURE_UNITS)[number];
  /** Cost in the invoice's current `costBasis`. */
  totalCents: number;
  /** Tax on this line (printed, or the invoice tax shared across taxable lines). */
  taxCents: number;
  confidence: ScannedLine["confidence"];
};

export type ReviewInvoice = {
  supplier: string;
  invoiceNumber: string;
  invoiceDate: string;
  currency: string | null;
  totalCents: number | null;
  taxCents: number | null;
  receiptUrl: string | null;
  duplicateOf: string | null;
  costBasis: "ex-tax" | "inc-tax";
  /** "GST", "VAT", "sales tax"… for the business's region. */
  taxLabel: string;
  /** Whether owners in this region can switch to ex-tax costs. */
  taxRecoverable: boolean;
  lines: ReviewLine[];
};

export type ScanResult = { ok: true; invoice: ReviewInvoice } | { error: string };

export const saveLineSchema = z.object({
  description: z.string().trim().min(1).max(200),
  materialId: z.string().min(1),
  newBaseUnit: z.enum(MEASURE_UNITS).optional(),
  quantity: z.number().positive(),
  unit: z.enum(MEASURE_UNITS),
  totalCents: z.number().int().min(0),
});

export const saveInvoiceSchema = z.object({
  supplier: z.string().trim().max(120),
  invoiceNumber: z.string().trim().max(60),
  invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  receiptUrl: z.string().url().nullable(),
  lines: z.array(saveLineSchema).min(1).max(80),
});

export type SaveInvoiceInput = z.infer<typeof saveInvoiceSchema>;
