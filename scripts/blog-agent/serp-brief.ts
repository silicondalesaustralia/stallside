import { z } from "zod";
import { askJson } from "./openai";

const serpBriefSchema = z.object({
  primaryQuery: z.string().min(1),
  intent: z.string().min(1),
  results: z
    .array(
      z.object({
        url: z.string().min(1),
        title: z.string().min(1),
        covers: z.array(z.string()).max(12),
        weaknesses: z.array(z.string()).max(8),
      }),
    )
    .max(6),
  mustCover: z.array(z.string()).max(15),
  gaps: z.array(z.string()).max(12),
  readerQuestions: z.array(z.string()).max(12),
  formatNotes: z.string(),
});

export type SerpBrief = z.infer<typeof serpBriefSchema>;

const BRIEF_SHAPE = `{
  "primaryQuery": string (the search a reader would type),
  "intent": string (what they need to decide or do next),
  "results": [up to 5: { "url": string, "title": string, "covers": [string], "weaknesses": [string] }],
  "mustCover": [string] (subtopics most top results cover; readers expect them),
  "gaps": [string] (useful things none or few results cover well, especially Australian specifics),
  "readerQuestions": [string] (questions the results raise or leave unanswered),
  "formatNotes": string (typical length, structure, tables/checklists, freshness of top results)
}`;

/** Search the topic's main query and read the top results to find what a better article must add. */
export async function buildSerpBrief(topic: unknown, targetPost: unknown): Promise<SerpBrief | null> {
  try {
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
  } catch (error) {
    console.error("Search results brief failed; drafting without it", error);
    return null;
  }
}
