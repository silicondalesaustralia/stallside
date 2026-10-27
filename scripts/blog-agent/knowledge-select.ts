import { listCategories, type KnowledgeArticle } from "../../src/lib/knowledge-base";

const FULL_ARTICLES = 5;
const STOP_WORDS = new Set(["the", "and", "for", "with", "your", "you", "how", "what", "from", "into", "that", "this", "vendl", "are", "can", "when", "their"]);

function allArticles(): KnowledgeArticle[] {
  return listCategories().flatMap((c) => c.articles);
}

function isComingSoon(article: KnowledgeArticle): boolean {
  return article.availability === "Coming soon";
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
export function knowledgeIndex(): Array<{ slug: string; title: string; summary: string; comingSoon?: boolean }> {
  return allArticles().map((a) => ({ slug: a.slug, title: a.title, summary: a.summary, ...(isComingSoon(a) ? { comingSoon: true } : {}) }));
}

/** Full steps for the articles that best match the topic, plus the one-line index of the rest. */
export function relevantKnowledge(topicText: string) {
  const wanted = terms(topicText);
  const ranked = allArticles()
    .map((article) => ({ article, score: overlap(article, wanted) }))
    .sort((a, b) => b.score - a.score);
  const full = ranked.slice(0, FULL_ARTICLES).map(({ article }) => article);
  const fullSlugs = new Set(full.map((a) => a.slug));
  console.log(`Knowledge base: full text for ${full.map((a) => a.slug).join(", ")}`);
  return {
    source: "src/lib/knowledge-base/*.ts on origin/main (cite as src/lib/knowledge-base, article slug)",
    relevantArticles: full.map((a) => ({
      slug: a.slug,
      title: a.title,
      summary: a.summary,
      steps: [...a.steps, ...(a.tips ?? [])],
      ctas: a.ctas,
      comingSoon: isComingSoon(a),
    })),
    otherArticles: knowledgeIndex().filter((a) => !fullSlugs.has(a.slug)),
  };
}
