import type { KnowledgeArticle, KnowledgeCategory } from "./types";
import { gettingStartedArticles } from "./getting-started";
import { standsQrArticles } from "./stands-qr";
import { productsStockArticles } from "./products-stock";
import { ordersAlertsBillingArticles } from "./orders-alerts-billing";

export type { KnowledgeArticle, KnowledgeCategory, KnowledgeCta } from "./types";

export const knowledgeCategories: KnowledgeCategory[] = [
  { id: "getting-started", title: "Getting started", articles: gettingStartedArticles },
  { id: "stands-qr", title: "Stands and QR", articles: standsQrArticles },
  { id: "products-stock", title: "Products and stock", articles: productsStockArticles },
  {
    id: "orders-overview",
    title: "Orders and overview",
    articles: ordersAlertsBillingArticles.filter((a) => a.slug === "sales-orders"),
  },
  {
    id: "alerts",
    title: "Alerts",
    articles: ordersAlertsBillingArticles.filter((a) => a.slug === "alerts-push"),
  },
  {
    id: "billing",
    title: "Billing",
    articles: ordersAlertsBillingArticles.filter(
      (a) => a.slug === "billing" || a.slug === "customer-payments",
    ),
  },
];

const allArticles: KnowledgeArticle[] = knowledgeCategories.flatMap(
  (category) => category.articles,
);

export function listCategories(): KnowledgeCategory[] {
  return knowledgeCategories;
}

export function getArticle(slug: string): KnowledgeArticle | undefined {
  return allArticles.find((article) => article.slug === slug);
}

export function getRelatedArticles(article: KnowledgeArticle): KnowledgeArticle[] {
  return article.related
    .map((slug) => getArticle(slug))
    .filter((item): item is KnowledgeArticle => Boolean(item));
}

/** Turn a YouTube/Vimeo watch URL into an embeddable src, or null. */
export function toEmbedUrl(videoUrl: string | null): string | null {
  if (!videoUrl) return null;
  try {
    const url = new URL(videoUrl);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = url.searchParams.get("v") || url.pathname.split("/embed/")[1];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "vimeo.com") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    if (host === "player.vimeo.com") {
      return videoUrl;
    }
  } catch {
    return null;
  }
  return null;
}
