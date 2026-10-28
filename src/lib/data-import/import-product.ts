import { z } from "zod";

const cents = z.number().int().min(0).max(100_000_000);
const text = (max: number) => z.string().max(max);

export const importVariantSchema = z.object({
  values: z.array(text(60).min(1)).min(1).max(3),
  priceCents: cents,
  compareAtCents: cents.nullable(),
  costCents: cents.nullable(),
  sku: text(64).nullable(),
  upc: text(64).nullable(),
  stock: z.number().int().min(0).max(1_000_000).nullable(),
});

export const importProductSchema = z.object({
  ref: text(200),
  name: text(120).min(1),
  description: text(2000),
  category: text(80),
  imageUrl: text(2048),
  hidden: z.boolean(),
  gstFree: z.boolean().nullable(),
  priceCents: cents,
  compareAtCents: cents.nullable(),
  costCents: cents.nullable(),
  sku: text(64).nullable(),
  upc: text(64).nullable(),
  stock: z.number().int().min(0).max(1_000_000).nullable(),
  optionNames: z.array(text(40).min(1)).max(3),
  variants: z.array(importVariantSchema).max(100),
});

export type ImportVariant = z.infer<typeof importVariantSchema>;
export type ImportProduct = z.infer<typeof importProductSchema>;

export const importCustomerSchema = z.object({
  email: z.string().email().max(200),
  name: text(120).nullable(),
  phone: text(40).nullable(),
  notes: text(1000).nullable(),
  marketingConsent: z.boolean(),
});
export type ImportCustomer = z.infer<typeof importCustomerSchema>;

export const importStockSchema = z.object({
  ref: text(200),
  sku: text(64).nullable(),
  name: text(120).nullable(),
  values: z.array(text(60)).max(3),
  stock: z.number().int().min(0).max(1_000_000),
});
export type ImportStock = z.infer<typeof importStockSchema>;

export type ImportIssue = { ref: string; message: string };
