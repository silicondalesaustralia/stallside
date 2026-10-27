import { existsSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";
import type { KnowledgeCta } from "../../src/lib/knowledge-base";
import { productContextLabel, productContextRoot } from "./repo-context";

type KnowledgeArticle = { slug: string; title: string; summary: string; steps: string[]; ctas: KnowledgeCta[]; comingSoon: boolean };
/** Article fields across branches: newer knowledge bases use availability and tips. */
type RawArticle = Omit<KnowledgeArticle, "comingSoon"> & { comingSoon?: boolean; availability?: string; tips?: string[] };
type IndexModule = { listCategories: () => Array<{ articles: RawArticle[] }> };
type ExtraModule = { ordersAlertsBillingArticles?: RawArticle[] };

function normalize(a: RawArticle): KnowledgeArticle {
  return {
    slug: a.slug,
    title: a.title,
    summary: a.summary,
    steps: [...a.steps, ...(a.tips ?? [])],
    ctas: a.ctas,
    comingSoon: Boolean(a.comingSoon) || a.availability === "Coming soon",
  };
}

const FULL_ARTICLES = 5;
const STOP_WORDS = new Set(["the", "and", "for", "with", "your", "you", "how", "what", "from", "into", "that", "this", "vendl", "are", "can", "when", "their"]);
const EXTRA_FILE = "orders-alerts-billing.ts";

let loaded: Promise<KnowledgeArticle[]> | null = null;

async function importArticles(): Promise<KnowledgeArticle[]> {
  const dir = join(productContextRoot(), "src/lib/knowledge-base");
  const index = (await import(pathToFileURL(join(dir, "index.ts")).href)) as IndexModule;
  const extra = existsSync(join(dir, EXTRA_FILE))
    ? ((await import(pathToFileURL(join(dir, EXTRA_FILE)).href)) as ExtraModule).ordersAlertsBillingArticles ?? []
    : [];
  const seen = new Set<string>();
  const articles = [...index.listCategories().flatMap((c) => c.articles), ...extra].map(normalize).filter((a) => {
    if (seen.has(a.slug)) return false;
    seen.add(a.slug);
    return true;
  });
  console.log(`Knowledge base: ${articles.length} articles from ${productContextLabel()}`);
  return articles;
}

function allArticles(): Promise<KnowledgeArticle[]> {
  loaded ??= importArticles();
  return loaded;
}

function terms(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
      .map((word) => word.replace(/s$/, "")),
  );
}

function overlap(article: KnowledgeArticle, wanted: Set<string>): number {
  const titleTerms = terms(`${article.title} ${article.slug}`);
  const bodyTerms = terms(`${article.summary} ${article.steps.join(" ")}`);
  let score = 0;
  for (const term of wanted) score += (titleTerms.has(term) ? 3 : 0) + (bodyTerms.has(term) ? 1 : 0);
  return score;
}

/** One line per knowledge base article: enough for the planner to name real features. */
export async function knowledgeIndex(): Promise<Array<{ slug: string; title: string; summary: string; comingSoon?: boolean }>> {
  return (await allArticles()).map(({ slug, title, summary, comingSoon }) => ({ slug, title, summary, ...(comingSoon ? { comingSoon } : {}) }));
}

/** Full steps for the articles that best match the topic, plus the one-line index of the rest. */
export async function relevantKnowledge(topicText: string) {
  const wanted = terms(topicText);
  const ranked = (await allArticles())
    .map((article) => ({ article, score: overlap(article, wanted) }))
    .sort((a, b) => b.score - a.score);
  const full = ranked.slice(0, FULL_ARTICLES).map(({ article }) => article);
  const fullSlugs = new Set(full.map((a) => a.slug));
  console.log(`Knowledge base: full text for ${full.map((a) => a.slug).join(", ")}`);
  return {
    source: `src/lib/knowledge-base/*.ts on ${productContextLabel()} (cite as src/lib/knowledge-base, article slug)`,
    relevantArticles: full.map(({ slug, title, summary, steps, ctas, comingSoon }) => ({ slug, title, summary, steps, ctas, comingSoon })),
    otherArticles: (await knowledgeIndex()).filter((a) => !fullSlugs.has(a.slug)),
  };
}
