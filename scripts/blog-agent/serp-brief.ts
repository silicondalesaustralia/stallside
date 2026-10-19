import { hasDataForSeo } from "./dataforseo";
import { buildGoogleBrief } from "./google-brief";
import { askJson } from "./openai";
import { BRIEF_SHAPE, serpBriefSchema, type SerpBrief } from "./serp-brief-schema";

export type { SerpBrief } from "./serp-brief-schema";

/** Fallback when DataForSEO is unavailable: the research model searches the web itself. */
async function buildWebSearchBrief(topic: unknown, targetPost: unknown): Promise<SerpBrief | null> {
  const raw = await askJson({
    task: "RESEARCH",
    instructions: [
      "You are a search analyst for Vendl's blog (Australian small sellers and home producers).",
      "Pick the single search query this topic should rank for (prefer the topic's targetQueries).",
      "Search it with web search, prioritising Australian results, and open the top 5 organic results.",
      "Skip Vendl's own pages, forums and marketplace listings. Record only what you actually read on each page.",
      `Return only a json object with this shape:\n${BRIEF_SHAPE}`,
    ].join("\n"),
    input: JSON.stringify({ topic, existingVendlPost: targetPost }),
    webSearch: true,
    maxOutputTokens: 8_000,
  });
  const parsed = serpBriefSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("Search results brief failed validation; drafting without it", parsed.error.issues);
    return null;
  }
  return parsed.data;
}

/** Read the top results for the topic's main query to find what a better article must add. */
export async function buildSerpBrief(topic: { targetQueries?: unknown }, targetPost: unknown): Promise<SerpBrief | null> {
  try {
    if (hasDataForSeo()) {
      const google = await buildGoogleBrief(topic, targetPost);
      if (google) {
        console.log(`Search brief from Google AU for "${google.primaryQuery}" (${google.results.length} pages analysed)`);
        return google;
      }
      console.warn("Google results unavailable; falling back to web search for the brief");
    }
    return await buildWebSearchBrief(topic, targetPost);
  } catch (error) {
    console.error("Search results brief failed; drafting without it", error);
    return null;
  }
}
