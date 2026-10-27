/**
 * Planner step for one topic the owner typed in (a keyword or phrase): research search demand,
 * pick the angle, target queries and Vendl tie-in exactly like the evening planner, then save
 * them on the topic so the writer drafts it the same way as a picked idea.
 */
import { recommendationSchema } from "../../src/lib/blog/recommendation-schemas";
import { parseTargetQueries } from "../../src/lib/blog/types";
import { appGet, appPost } from "./api";
import { plannerContext, type BlogContext } from "./compact-context";
import { hasDataForSeo } from "./dataforseo";
import { keywordSuggestions, relatedKeywords } from "./keyword-data";
import { knowledgeIndex } from "./knowledge-select";
import { askJson } from "./openai";
import { playbookFor, recentCommits, todayInAdelaide } from "./repo-context";
import { addSearchVolumes } from "./search-volume";
import type { Topic } from "./topic";

const DEMAND_PER_SOURCE = 25;

const OUTPUT_CONTRACT = `Return only a json object for ONE new post:
{
  "title": string, "angle": string (what the post covers and for whom),
  "section": "NEWS" | "GUIDE",
  "whyNow": string (the evidence: search demand, news date, feature commit),
  "vendlTieIn": string (the named Vendl feature(s) from the knowledge base that solve the reader's problem, and the signup hook),
  "score": integer 0-100,
  "targetQueries": [2-5 items: { "query": string }] (the owner's keyword first when it is a real search phrase; 2-5 words as typed into Google, no "Australia" suffix, no brand names; prefer exact queries from searchDemand),
  "sourceUrls": [string],
  "timeSensitive": boolean
}`;

/** Owner-entered topics arrive without planner research; updates to live posts never need it. */
export function needsBrief(topic: Topic): boolean {
  return !topic.targetPostSlug && parseTargetQueries(topic.targetQueries).length === 0;
}

async function keywordDemand(keyword: string): Promise<Array<{ keyword: string; volume: number | null }>> {
  if (!hasDataForSeo()) return [];
  try {
    const [suggested, related] = await Promise.all([
      keywordSuggestions([keyword], DEMAND_PER_SOURCE),
      relatedKeywords(keyword, DEMAND_PER_SOURCE),
    ]);
    const merged = new Map<string, number | null>();
    for (const item of [...suggested, ...related]) if (!merged.has(item.keyword)) merged.set(item.keyword, item.volume);
    console.log(`Keyword demand: ${merged.size} Google AU searches around "${keyword}"`);
    return [...merged].map(([k, volume]) => ({ keyword: k, volume }));
  } catch (error) {
    console.error("Keyword demand lookup failed; briefing without it", error);
    return [];
  }
}

export async function briefTopic(topic: Topic): Promise<Topic> {
  const keyword = topic.title;
  const [context, searchDemand, knowledgeBase] = await Promise.all([
    appGet<BlogContext>("/context"),
    keywordDemand(keyword),
    knowledgeIndex(),
  ]);
  const raw = await askJson({
    task: "PLAN",
    instructions: `You are Vendl's blog planner. The owner has asked for one post about a keyword; brief it with the same standards as an evening recommendation. Follow this playbook exactly.\n\n${playbookFor("PLAN")}\n\n${OUTPUT_CONTRACT}`,
    input: `Brief one new post for this keyword. Pick an angle no existing post or backlog topic already covers. Use web search for current facts and news.\n${JSON.stringify({
      today: todayInAdelaide(),
      keyword,
      ownerAngle: topic.angle,
      ownerSection: topic.section,
      blogContext: plannerContext(context),
      ...(searchDemand.length ? { searchDemand } : {}),
      commits: recentCommits(14),
      knowledgeBase,
    })}`,
    webSearch: true,
    maxOutputTokens: 6_000,
  });
  const fields = typeof raw === "object" && raw !== null ? raw : {};
  const parsed = recommendationSchema.safeParse({ ...fields, source: "MANUAL", targetPostSlug: null });
  if (!parsed.success) {
    throw new Error(`Keyword brief failed validation: ${JSON.stringify(parsed.error.issues).slice(0, 1500)}`);
  }
  const [rec] = (await addSearchVolumes({ recommendations: [parsed.data] })).recommendations;
  const brief = {
    title: rec.title,
    angle: rec.angle,
    section: rec.section,
    notes: `Requested keyword: "${keyword}". ${rec.whyNow}`.slice(0, 2000),
    featureRef: rec.vendlTieIn,
    targetQueries: rec.targetQueries ?? [{ query: keyword }],
    sourceUrls: rec.sourceUrls ?? [],
  };
  await appPost("/topics", { update: [{ id: topic.id, ...brief }] });
  console.log(`Briefed "${keyword}" as: ${brief.title}`);
  return { ...topic, ...brief };
}
