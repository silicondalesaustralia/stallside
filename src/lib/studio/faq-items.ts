import { z } from "zod";
import { WEBSITE_LIMITS as L } from "@/lib/website/schema/limits";

export const FAQ_MAX_ITEMS = 30;
export const FAQ_QUESTION_MAX = 300;

const faqItemSchema = z.object({
  id: z.string().min(1).max(L.idChars),
  question: z.string().max(FAQ_QUESTION_MAX),
  answer: z.string().max(L.bodyChars),
});

export const faqItemsSchema = z.array(faqItemSchema).max(FAQ_MAX_ITEMS);

export type FaqItem = z.infer<typeof faqItemSchema>;

/** Saved FAQ items, or none when the prop is missing or malformed. */
export function parseFaqItems(value: unknown): FaqItem[] {
  const parsed = faqItemsSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}

/** Items worth showing to shoppers: a question is required. */
export function visibleFaqItems(items: FaqItem[]): FaqItem[] {
  return items.filter((item) => item.question.trim());
}
