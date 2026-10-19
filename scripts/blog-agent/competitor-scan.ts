import { z } from "zod";
import { askJson } from "./openai";

/** Direct home-producer competitors first, then the broad platforms. */
export const COMPETITORS = [
  "CottageCMS",
  "Bakebug",
  "Hotplate",
  "Loafly",
  "Bakesy",
  "Shopify",
  "Square Online",
  "Wix",
] as const;

const competitorScanSchema = z.object({
  competitors: z
    .array(
      z.object({
        name: z.string().min(1),
        site: z.string(),
        recentContent: z.array(z.object({ title: z.string(), url: z.string(), date: z.string().nullish() })).max(8),
        productChanges: z.array(z.object({ change: z.string(), url: z.string(), date: z.string().nullish() })).max(6),
        positioning: z.string(),
      }),
    )
    .max(COMPETITORS.length),
  contentGaps: z
    .array(z.object({ topic: z.string().min(1), evidence: z.string().min(1), competitorUrls: z.array(z.string()).max(5) }))
    .max(10),
});

export type CompetitorScan = z.infer<typeof competitorScanSchema>;

const SCAN_SHAPE = `{
  "competitors": [{ "name": string, "site": string (official URL you found),
    "recentContent": [{ "title": string, "url": string, "date": string | null }] (blog, guides, help articles from the last ~30 days),
    "productChanges": [{ "change": string, "url": string, "date": string | null }] (features, pricing, fees),
    "positioning": string (one sentence: who they target and how) }],
  "contentGaps": [{ "topic": string, "evidence": string, "competitorUrls": [string] }]
    (topics competitors cover that Vendl's blog doesn't, or that every competitor covers badly)
}`;

/** Weekly look at competitor blogs, help centres and changelogs for topics Vendl is missing. */
export async function runCompetitorScan(existingTitles: string[]): Promise<CompetitorScan | null> {
  try {
    const raw = await askJson({
      instructions: [
        "You research competitors of Vendl, an ecommerce platform for Australian home producers, farm stands and small sellers.",
        `Competitors: ${COMPETITORS.join(", ")}. Find each one's official site with web search, then read their blog, guides, help centre and changelog or pricing pages.`,
        "Record only pages you actually opened. If a competitor has no blog or you cannot find recent content, return empty arrays for it.",
        "Content gaps must be useful to sellers (not product tours) and must not duplicate Vendl's existing titles.",
        `Return only a json object with this shape:\n${SCAN_SHAPE}`,
      ].join("\n"),
      input: JSON.stringify({ vendlExistingTitles: existingTitles }),
      webSearch: true,
      maxOutputTokens: 12_000,
    });
    const parsed = competitorScanSchema.safeParse(raw);
    if (!parsed.success) {
      console.error("Competitor scan failed validation; planning without it", parsed.error.issues);
      return null;
    }
    return parsed.data;
  } catch (error) {
    console.error("Competitor scan failed; planning without it", error);
    return null;
  }
}
