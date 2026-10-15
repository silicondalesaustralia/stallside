import type { FaqItem } from "@/lib/studio/faq-view";
import { graphIds, type JsonLdNode } from "./clean";

/** A list of links (products, categories, posts) shown on a collection or index page. */
export function itemListNode(pageUrl: string, items: { name: string; url: string }[]): JsonLdNode | null {
  if (!items.length) return null;
  return {
    "@type": "ItemList",
    "@id": `${pageUrl}#itemlist`,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: item.url,
      name: item.name,
    })),
  };
}

export type ArticleInput = {
  pageUrl: string;
  homeUrl: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  publishedAt?: string | null;
  updatedAt: string;
  section?: string | null;
  hasFounder: boolean;
  language: string;
};

/** BlogPosting authored by the founder when known, published by the business. */
export function blogPostingNode(input: ArticleInput): JsonLdNode {
  const ids = graphIds(input.homeUrl, input.pageUrl);
  return {
    "@type": "BlogPosting",
    "@id": `${input.pageUrl}#article`,
    headline: input.title.slice(0, 110),
    description: input.description ?? undefined,
    image: input.imageUrl ?? undefined,
    datePublished: input.publishedAt ?? input.updatedAt,
    dateModified: input.updatedAt,
    articleSection: input.section ?? undefined,
    inLanguage: input.language,
    author: { "@id": input.hasFounder ? ids.founder : ids.business },
    publisher: { "@id": ids.business },
    isPartOf: { "@id": ids.webpage },
    mainEntityOfPage: { "@id": ids.webpage },
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<(br|\/p|\/li|\/div|\/h[1-6])\b[^>]*>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function faqPageNodes(pageUrl: string, items: FaqItem[]): JsonLdNode[] {
  return items
    .filter((item) => item.question.trim() && stripHtml(item.answer))
    .map((item, i) => ({
      "@type": "Question",
      "@id": `${pageUrl}#faq-${i + 1}`,
      name: item.question.trim(),
      acceptedAnswer: { "@type": "Answer", text: stripHtml(item.answer) },
    }));
}
