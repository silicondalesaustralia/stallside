import type { NewsArticle } from "@/lib/farms-stand-news/types";
import { getAllArticles, newsArticlePath } from "@/lib/farms-stand-news";
import { getAllGuides, STATIC_GUIDE_PAGES } from "./guides";

export type RelatedArticle = {
  href: string;
  title: string;
  excerpt: string;
  image?: NewsArticle["image"];
};

const STOP_WORDS = new Set(
  "a an and are as at be by can do for from how in is it of on or the to what when with you your vendl".split(" "),
);

function terms(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 2 && !STOP_WORDS.has(word)),
  );
}

function articleTerms(article: Pick<NewsArticle, "title" | "keywords" | "excerpt">) {
  return terms(`${article.title} ${article.keywords ?? ""} ${article.excerpt}`);
}

function overlap(a: Set<string>, b: Set<string>): number {
  let count = 0;
  for (const word of a) if (b.has(word)) count += 1;
  return count;
}

function toRelated(article: NewsArticle): RelatedArticle {
  return {
    href: article.canonicalPath ?? newsArticlePath(article.slug),
    title: article.title,
    excerpt: article.excerpt,
    image: article.image,
  };
}

/** Live guides and news ranked by shared keywords, padded with the hand-built guide pages. */
export async function getRelatedArticles(current: NewsArticle, limit: number): Promise<RelatedArticle[]> {
  try {
    const currentPath = current.canonicalPath ?? newsArticlePath(current.slug);
    const currentTerms = articleTerms(current);
    const [news, guides] = await Promise.all([getAllArticles(), getAllGuides()]);
    const ranked = [...guides, ...news]
      .filter((article) => (article.canonicalPath ?? newsArticlePath(article.slug)) !== currentPath)
      .map((article) => ({
        article,
        score: overlap(currentTerms, articleTerms(article)) + (article.sectionPath === current.sectionPath ? 1 : 0),
      }))
      .sort((a, b) => b.score - a.score || Date.parse(b.article.publishedAt) - Date.parse(a.article.publishedAt))
      .map(({ article }) => toRelated(article));
    const fallback = STATIC_GUIDE_PAGES.map((page) => ({
      href: page.canonicalPath ?? `/${page.slug}`,
      title: page.title,
      excerpt: page.excerpt,
    }));
    return [...ranked, ...fallback].slice(0, limit);
  } catch (error) {
    console.error("[blog] failed to load related articles", error);
    return [];
  }
}
