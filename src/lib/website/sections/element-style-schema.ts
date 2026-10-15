import { z } from "zod";
import { isColourValue } from "./colour-value";
import {
  ELEMENT_CASES,
  ELEMENT_FONTS,
  ELEMENT_SIZES,
  ELEMENT_WEIGHTS,
  type ElementStyle,
  type ElementStyles,
} from "./element-style";

export const elementStyleSchema = z.object({
  colour: z.string().refine(isColourValue).optional(),
  size: z.enum(ELEMENT_SIZES).optional(),
  font: z.enum(ELEMENT_FONTS).optional(),
  weight: z.enum(ELEMENT_WEIGHTS).optional(),
  italic: z.boolean().optional(),
  textCase: z.enum(ELEMENT_CASES).optional(),
}) satisfies z.ZodType<ElementStyle>;

type ElementKey = keyof ElementStyle;

const ELEMENT_ID = /^[a-zA-Z][a-zA-Z0-9]{0,31}$/;

/** Reads a section's saved `elements`; bad fields are dropped and empty entries removed. */
export function parseElementStyles(raw: unknown): ElementStyles | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const out: ElementStyles = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!ELEMENT_ID.test(id) || !value || typeof value !== "object") continue;
    const entry: Record<string, unknown> = {};
    for (const key of Object.keys(elementStyleSchema.shape) as ElementKey[]) {
      const parsed = elementStyleSchema.shape[key].safeParse((value as Record<string, unknown>)[key]);
      if (parsed.success && parsed.data !== undefined) entry[key] = parsed.data;
    }
    if (Object.keys(entry).length) out[id] = entry as ElementStyle;
  }
  return Object.keys(out).length ? out : undefined;
}
