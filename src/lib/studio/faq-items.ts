import { z } from "zod";
import { WEBSITE_LIMITS as L } from "@/lib/website/schema/limits";
import { FAQ_MAX_ITEMS, FAQ_QUESTION_MAX, type FaqItem } from "./faq-view";

export * from "./faq-view";

const faqItemSchema = z.object({
  id: z.string().min(1).max(L.idChars),
  question: z.string().max(FAQ_QUESTION_MAX),
  answer: z.string().max(L.bodyChars),
}) satisfies z.ZodType<FaqItem>;

export const faqItemsSchema = z.array(faqItemSchema).max(FAQ_MAX_ITEMS);

/** Saved FAQ items, or none when the prop is missing or malformed. */
export function parseFaqItems(value: unknown): FaqItem[] {
  const parsed = faqItemsSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}
