import type { NewsArticle } from "./types";
import { vendlVsBakesyArticle } from "./articles/vendl-vs-bakesy";
import {
  getLiveBlogArticle,
  getLiveBlogArticles,
  getLiveBlogSlugs,
} from "@/lib/blog/queries";

export type { NewsArticle, NewsArticleMeta, NewsArticleImage, NewsAuthor } from "./types";
export { newsArticleGraphSchema } from "./schema";
export { newsIndexPath, newsArticlePath } from "./paths";

const articles: NewsArticle[] = [vendlVsBakesyArticle];

function byPublishedDesc(a: NewsArticle, b: NewsArticle) {
  return Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
}

/** Code-based slugs are reserved so DB posts can never shadow them. */
export function isCodeArticleSlug(slug: string): boolean {
  return articles.some((article) => article.slug === slug);
}

export async function getAllArticles(): Promise<NewsArticle[]> {
  const fromDb = await getLiveBlogArticles("NEWS");
  return [...articles, ...fromDb].sort(byPublishedDesc);
}

export async function getArticle(slug: string): Promise<NewsArticle | undefined> {
  const code = articles.find((article) => article.slug === slug);
  if (code) return code;
  return getLiveBlogArticle("NEWS", slug);
}

export async function getArticleSlugs(): Promise<string[]> {
  const fromDb = await getLiveBlogSlugs("NEWS");
  return [...articles.map((article) => article.slug), ...fromDb];
}
