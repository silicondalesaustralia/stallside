import { parseTargetQueries } from "../../src/lib/blog/types";
import { googleSerp } from "./google-serp";
import { relatedKeywords } from "./keyword-data";
import { askJson } from "./openai";
import { fetchPageText } from "./page-text";
import { BRIEF_SHAPE, serpBriefSchema, type SerpBrief } from "./serp-brief-schema";

const PAGES_TO_READ = 5;

/** Highest-volume target query, else most impressions, else the first one listed. */
function primaryQuery(targetQueries: unknown): { query: string; volume: number | null } | null {
  const queries = parseTargetQueries(targetQueries);
  if (queries.length === 0) return null;
  const best = [...queries].sort(
    (a, b) => (b.volume ?? -1) - (a.volume ?? -1) || (b.impressions ?? 0) - (a.impressions ?? 0),
  )[0];
  return { query: best.query, volume: best.volume ?? null };
}

/** Search brief from live Google Australia results; null when there is no target query or no data. */
export async function buildGoogleBrief(
  topic: { targetQueries?: unknown },
  targetPost: unknown,
): Promise<SerpBrief | null> {
  const primary = primaryQuery(topic.targetQueries);
  if (!primary) return null;
  const [serp, variations] = await Promise.all([googleSerp(primary.query), relatedKeywords(primary.query)]);
  if (!serp || serp.organic.length === 0) return null;

  const competitors = serp.organic.filter((r) => !/(^|\.)vendl\.app$/i.test(r.domain)).slice(0, PAGES_TO_READ);
  const pages = await Promise.all(
    competitors.map(async (r) => ({ ...r, text: (await fetchPageText(r.url)) ?? `(page unreadable; snippet) ${r.description}` })),
  );

  const raw = await askJson({
    task: "RESEARCH",
    instructions: [
      "You are a search analyst for Vendl's blog (Australian small sellers and home producers).",
      "These are the live Google Australia results for the primary query, with the text of the top pages.",
      "Analyse only what the page text shows. Skip forums and marketplace listings in 'results'.",
      `Return only a json object with this shape:\n${BRIEF_SHAPE}`,
    ].join("\n"),
    input: JSON.stringify({
      primaryQuery: primary.query,
      topic,
      existingVendlPost: targetPost,
      pages,
      peopleAlsoAsk: serp.peopleAlsoAsk,
      relatedSearches: serp.relatedSearches,
    }),
    maxOutputTokens: 8_000,
  });
  const parsed = serpBriefSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("Google search brief failed validation", parsed.error.issues);
    return null;
  }
  return {
    ...parsed.data,
    primaryQuery: primary.query,
    google: {
      primaryQueryVolume: primary.volume,
      peopleAlsoAsk: serp.peopleAlsoAsk,
      relatedSearches: serp.relatedSearches,
      aiOverview: serp.aiOverview,
      keywordVariations: variations,
    },
  };
}
