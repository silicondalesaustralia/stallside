import { z } from "zod";
import { askJson } from "./openai";

const MEDIUM_TAGS = ["farmers-market", "small-business", "cottage-food", "home-bakery", "ecommerce", "baking-business"];
const MEDIUM_MAX_PER_TAG = 8;

type MediumItem = { tag: string; title: string; url: string; date: string | null };

const communityScanSchema = z.object({
  topics: z
    .array(
      z.object({
        question: z.string().min(1),
        platforms: z.array(z.enum(["reddit", "quora", "linkedin", "medium"])).min(1),
        realWording: z.array(z.string()).max(5),
        urls: z.array(z.string()).max(6),
        signal: z.string().min(1),
      }),
    )
    .max(15),
});

export type CommunityScan = z.infer<typeof communityScanSchema>;

const SCAN_SHAPE = `{
  "topics": [up to 15: {
    "question": string (the underlying question sellers have),
    "platforms": ["reddit" | "quora" | "linkedin" | "medium"],
    "realWording": [string] (short phrases sellers actually used, paraphrased if over 15 words),
    "urls": [string] (threads/posts you actually opened),
    "signal": string (how often it comes up, upvotes/replies, recency)
  }]
}`;

function tagValue(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`));
  return match?.[1]?.trim() || null;
}

async function mediumTag(tag: string): Promise<MediumItem[]> {
  try {
    const res = await fetch(`https://medium.com/feed/tag/${tag}`, { headers: { "User-Agent": "VendlBlogAgent/1.0" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    return xml
      .split("<item>")
      .slice(1, MEDIUM_MAX_PER_TAG + 1)
      .map((item) => ({ tag, title: tagValue(item, "title") ?? "", url: tagValue(item, "link") ?? "", date: tagValue(item, "pubDate") }))
      .filter((item) => item.title && item.url);
  } catch (error) {
    console.error(`Medium feed ${tag} failed`, error);
    return [];
  }
}

/** Weekly scan of seller communities for real questions and wording. */
export async function runCommunityScan(existingTitles: string[]): Promise<CommunityScan | null> {
  try {
    const medium = (await Promise.all(MEDIUM_TAGS.map(mediumTag))).flat();
    const raw = await askJson({
      task: "RESEARCH",
      instructions: [
        "You research what small sellers are asking online, for Vendl's blog (Australian farm stands, home bakers, makers, market stallholders, small online shops).",
        "Use web search restricted to reddit.com (e.g. r/smallbusiness, r/AusFinance, r/australia, r/Baking, r/homestead, r/farmersmarket, r/Etsy), quora.com and public linkedin.com posts, focusing on the last ~30 days.",
        "Also use the supplied Medium feed items. Group similar posts into one underlying question.",
        "Keep questions where a practical guide would genuinely help; skip ones Vendl's existing titles already answer.",
        "Record only threads you actually opened. Never include usernames or personal details.",
        `Return only a json object with this shape:\n${SCAN_SHAPE}`,
      ].join("\n"),
      input: JSON.stringify({ mediumItems: medium, vendlExistingTitles: existingTitles }),
      webSearch: true,
      maxOutputTokens: 10_000,
    });
    const parsed = communityScanSchema.safeParse(raw);
    if (!parsed.success) {
      console.error("Community scan failed validation; planning without it", parsed.error.issues);
      return null;
    }
    return parsed.data;
  } catch (error) {
    console.error("Community scan failed; planning without it", error);
    return null;
  }
}
