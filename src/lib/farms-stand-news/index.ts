import type { NewsArticle } from "./types";
import { vendlVsBakesyArticle } from "./articles/vendl-vs-bakesy";

export type { NewsArticle, NewsArticleMeta, NewsArticleImage, NewsAuthor } from "./types";
export { newsArticleGraphSchema } from "./schema";
export { newsIndexPath, newsArticlePath } from "./paths";

const articles: NewsArticle[] = [vendlVsBakesyArticle];

function byPublishedDesc(a: NewsArticle, b: NewsArticle) {
  return Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
}

export function getAllArticles(): NewsArticle[] {
  return [...articles].sort(byPublishedDesc);
}

export function getArticle(slug: string): NewsArticle | undefined {
  return articles.find((article) => article.slug === slug);
}

export function getArticleSlugs(): string[] {
  return articles.map((article) => article.slug);
}
