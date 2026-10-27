import type { KnowledgeCategory, KnowledgeSearchEntry } from "./types";

export type KnowledgeSearchHit = {
  entry: KnowledgeSearchEntry;
  score: number;
  snippet: string | null;
};

const SNIPPET_RADIUS = 80;

export function buildSearchIndex(categories: KnowledgeCategory[]): KnowledgeSearchEntry[] {
  return categories.flatMap((category) =>
    category.articles.map((article) => ({
      slug: article.slug,
      title: article.title,
      summary: article.summary,
      categoryTitle: category.title,
      keywords: (article.keywords ?? []).join(" "),
      body: [...article.steps, ...(article.tips ?? [])],
    })),
  );
}

export function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9$%]+/)
    .filter((token) => token.length > 1 || /\d/.test(token));
}

function countHits(text: string, token: string): number {
  return text.toLowerCase().includes(token) ? 1 : 0;
}

function makeSnippet(body: string[], tokens: string[]): string | null {
  for (const line of body) {
    const lower = line.toLowerCase();
    const at = tokens.map((t) => lower.indexOf(t)).find((i) => i >= 0);
    if (at === undefined) continue;
    const start = Math.max(0, at - SNIPPET_RADIUS);
    const end = Math.min(line.length, at + SNIPPET_RADIUS);
    return `${start > 0 ? "…" : ""}${line.slice(start, end).trim()}${end < line.length ? "…" : ""}`;
  }
  return null;
}

/** Every token must match somewhere; title and keyword matches rank highest. */
export function searchGuides(
  entries: KnowledgeSearchEntry[],
  query: string,
): KnowledgeSearchHit[] {
  const tokens = tokenize(query);
  if (!tokens.length) return [];
  const phrase = query.trim().toLowerCase();

  const hits: KnowledgeSearchHit[] = [];
  for (const entry of entries) {
    const bodyText = entry.body.join(" ");
    let score = 0;
    let matchedAll = true;
    for (const token of tokens) {
      const tokenScore =
        countHits(entry.title, token) * 6 +
        countHits(entry.keywords, token) * 4 +
        countHits(entry.categoryTitle, token) * 2 +
        countHits(entry.summary, token) * 2 +
        countHits(bodyText, token);
      if (!tokenScore) {
        matchedAll = false;
        break;
      }
      score += tokenScore;
    }
    if (!matchedAll) continue;
    if (entry.title.toLowerCase().includes(phrase)) score += 10;
    const inHeader = tokens.every((t) =>
      `${entry.title} ${entry.summary}`.toLowerCase().includes(t),
    );
    hits.push({ entry, score, snippet: inHeader ? null : makeSnippet(entry.body, tokens) });
  }
  return hits.sort((a, b) => b.score - a.score);
}
