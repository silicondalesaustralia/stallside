import { z } from "zod";
import { MAX_VARIANT_OPTIONS, MAX_VARIANTS_PER_PRODUCT } from "./variant-title";

const text = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => (v ? v : null));

const cents = z.number().int().min(0).max(100_000_000);
/** Omitted (undefined) means "keep the saved value". */
const keepable = <T extends z.ZodType>(schema: T) => schema.nullable().optional();

const variantSchema = z.object({
  values: z.array(text(60).min(1, "Every variant needs a value for each option.")),
  sku: optionalText(64),
  upc: keepable(z.string().trim().max(64)),
  priceCents: cents,
  compareAtCents: keepable(cents),
  costCents: keepable(cents),
  stockQuantity: z.number().int().min(0).max(1_000_000),
  imageUrl: keepable(z.string().trim().max(2048)),
});

const payloadSchema = z.object({
  optionNames: z.array(text(40).min(1, "Each option needs a name.")).max(MAX_VARIANT_OPTIONS),
  variants: z.array(variantSchema).max(MAX_VARIANTS_PER_PRODUCT),
});

export type VariantsPayload = z.infer<typeof payloadSchema>;

/** Validates the editor's variants payload; values must line up with option names. */
export function parseVariantsInput(
  raw: unknown,
): { ok: true; data: VariantsPayload } | { ok: false; error: string } {
  const parsed = payloadSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid variants." };
  }
  const { optionNames, variants } = parsed.data;
  if (new Set(optionNames.map((n) => n.toLowerCase())).size !== optionNames.length) {
    return { ok: false, error: "Option names must be different." };
  }
  if (variants.length > 0 && optionNames.length === 0) {
    return { ok: false, error: "Add at least one option (e.g. Size)." };
  }
  const seen = new Set<string>();
  for (const v of variants) {
    if (v.values.length !== optionNames.length) {
      return { ok: false, error: "Every variant needs a value for each option." };
    }
    const key = v.values.map((x) => x.toLowerCase()).join("|");
    if (seen.has(key)) {
      return { ok: false, error: `“${v.values.join(" / ")}” is listed twice.` };
    }
    seen.add(key);
  }
  return { ok: true, data: parsed.data };
}
