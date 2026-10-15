import type { SerializedNodes } from "@craftjs/core";
import { parseFaqItems, visibleFaqItems, type FaqItem } from "@/lib/studio/faq-items";
import { isPublicStudioNode } from "@/lib/studio/node-visibility";

/** Questions from every visible FAQ section on a page, for FAQPage structured data. */
export function faqItemsFromNodes(nodes: SerializedNodes | null | undefined): FaqItem[] {
  if (!nodes) return [];
  const items: FaqItem[] = [];
  for (const node of Object.values(nodes)) {
    const name = typeof node.type === "string" ? node.type : node.type?.resolvedName;
    if (name !== "CraftFaqSection" || !isPublicStudioNode(node)) continue;
    items.push(...visibleFaqItems(parseFaqItems(node.props?.items)));
  }
  return items;
}
