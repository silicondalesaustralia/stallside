import type { KnowledgeArticle, KnowledgeCategory } from "./types";
import { knowledgeCategories, START_HERE_SLUGS } from "./categories";

export type {
  KnowledgeArticle,
  KnowledgeCategory,
  KnowledgeCta,
  KnowledgeIconName,
  KnowledgeSearchEntry,
} from "./types";
export { toEmbedUrl } from "./embed";

export type KnowledgeArticleContext = {
  article: KnowledgeArticle;
  category: KnowledgeCategory;
  previous: KnowledgeArticle | null;
  next: KnowledgeArticle | null;
};

const allArticles: KnowledgeArticle[] = knowledgeCategories.flatMap(
  (category) => category.articles,
);

export function listCategories(): KnowledgeCategory[] {
  return knowledgeCategories;
}

export function getArticle(slug: string): KnowledgeArticle | undefined {
  return allArticles.find((article) => article.slug === slug);
}

export function getArticleContext(slug: string): KnowledgeArticleContext | null {
  for (const category of knowledgeCategories) {
    const index = category.articles.findIndex((article) => article.slug === slug);
    if (index < 0) continue;
    return {
      article: category.articles[index],
      category,
      previous: category.articles[index - 1] ?? null,
      next: category.articles[index + 1] ?? null,
    };
  }
  return null;
}

export function getRelatedArticles(article: KnowledgeArticle): KnowledgeArticle[] {
  return article.related
    .map((slug) => getArticle(slug))
    .filter((item): item is KnowledgeArticle => Boolean(item));
}

export function getStartHereArticles(): KnowledgeArticle[] {
  return START_HERE_SLUGS.map((slug) => getArticle(slug)).filter(
    (item): item is KnowledgeArticle => Boolean(item),
  );
}
