import { z } from "zod";
import type { GoogleSerp } from "./google-serp";
import type { KeywordVariation } from "./keyword-data";

export const serpBriefSchema = z.object({
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

/** Measured Google Australia data attached to the brief (not model-written). */
export type GoogleBriefData = {
  primaryQueryVolume: number | null;
  peopleAlsoAsk: string[];
  relatedSearches: string[];
  aiOverview: GoogleSerp["aiOverview"];
  keywordVariations: KeywordVariation[];
};

export type SerpBrief = z.infer<typeof serpBriefSchema> & { google?: GoogleBriefData };

export const BRIEF_SHAPE = `{
  "primaryQuery": string (the search a reader would type),
  "intent": string (what they need to decide or do next),
  "results": [up to 5: { "url": string, "title": string, "covers": [string], "weaknesses": [string] }],
  "mustCover": [string] (subtopics most top results cover; readers expect them),
  "gaps": [string] (useful things none or few results cover well, especially Australian specifics),
  "readerQuestions": [string] (questions the results raise or leave unanswered),
  "formatNotes": string (typical length, structure, tables/checklists, freshness of top results)
}`;
