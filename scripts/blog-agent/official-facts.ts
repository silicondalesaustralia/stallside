import { z } from "zod";
import { askJson } from "./openai";

/** Regulators (all of gov.au) plus the payment providers whose fees articles quote. */
const OFFICIAL_DOMAINS = ["gov.au", "stripe.com", "squareup.com"];

const officialFactsSchema = z.object({
  facts: z
    .array(
      z.object({
        claim: z.string().min(1),
        sourceTitle: z.string().min(1),
        sourceUrl: z.string().url(),
        jurisdiction: z.string().min(1),
      }),
    )
    .max(20),
  notFound: z.array(z.string()).max(10),
});

export type OfficialFacts = z.infer<typeof officialFactsSchema>;

const SHAPE = `{
  "facts": [up to 20: { "claim": string (one checkable fact, as the source states it), "sourceTitle": string, "sourceUrl": string (the page you read), "jurisdiction": string ("NSW", "Australia-wide", "Stripe AU"...) }],
  "notFound": [string] (facts the article needs that you could not confirm on these sites)
}`;

/** Facts the article will state (rules, fees, thresholds, dates), confirmed on official pages only. */
export async function gatherOfficialFacts(topic: unknown, today: string): Promise<OfficialFacts | null> {
  try {
    const raw = await askJson({
      task: "RESEARCH",
      instructions: [
        "You are a fact checker for Vendl's blog (Australian small sellers and home producers).",
        "List the regulatory, fee, threshold and date facts an article on this topic will need, then confirm each on the official page with web search.",
        "Food rules are state- and council-specific: name the jurisdiction for each fact. Prefer the regulator's own page over summaries.",
        "Record only what the page you opened says. Skip anything about Vendl itself.",
        `Today is ${today}. Return only a json object with this shape:\n${SHAPE}`,
      ].join("\n"),
      input: JSON.stringify({ topic }),
      webSearch: true,
      allowedDomains: OFFICIAL_DOMAINS,
      maxOutputTokens: 6_000,
    });
    const parsed = officialFactsSchema.safeParse(raw);
    if (!parsed.success) {
      console.error("Official facts failed validation; drafting without them", parsed.error.issues);
      return null;
    }
    console.log(`Official facts: ${parsed.data.facts.length} confirmed, ${parsed.data.notFound.length} not found`);
    return parsed.data;
  } catch (error) {
    console.error("Official facts check failed; drafting without it", error);
    return null;
  }
}
