import type { NewsArticle } from "@/lib/farms-stand-news/types";
import type { BlogListItem } from "@/components/blog/BlogArticleList";
import { getLiveBlogArticle, getLiveBlogArticles, getLiveBlogSlugs } from "./queries";

/** Hand-built reference pages that belong in the guides index. */
export const STATIC_GUIDE_PAGES: BlogListItem[] = [
  {
    slug: "sell-food-from-home",
    canonicalPath: "/sell-food-from-home",
    title: "Sell food from home in Australia",
    excerpt:
      "State-by-state rules for home food businesses: registration, labelling and where you can sell.",
  },
  {
    slug: "cottage-food-laws",
    canonicalPath: "/cottage-food-laws",
    title: "Cottage food laws in the United States",
    excerpt:
      "What each state allows home producers to make and sell, and where sales can happen.",
  },
];

export async function getAllGuides(): Promise<NewsArticle[]> {
  return getLiveBlogArticles("GUIDE");
}

export async function getGuide(slug: string): Promise<NewsArticle | undefined> {
  return getLiveBlogArticle("GUIDE", slug);
}

export async function getGuideSlugs(): Promise<string[]> {
  return getLiveBlogSlugs("GUIDE");
}
