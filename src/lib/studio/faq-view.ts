export const FAQ_MAX_ITEMS = 30;
export const FAQ_QUESTION_MAX = 300;

export type FaqItem = { id: string; question: string; answer: string };

/** Items worth showing to shoppers: a question is required. */
export function visibleFaqItems(items: FaqItem[]): FaqItem[] {
  return items.filter((item) => item.question.trim());
}
