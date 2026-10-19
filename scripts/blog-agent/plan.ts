/**
 * Evening planner: recommend 10 ranked blog ideas and email them with "Write this" links.
 *
 *   npx tsx scripts/blog-agent/plan.ts [--force]
 *
 * Scheduled twice (10:30 and 11:30 UTC) to cover Adelaide daylight saving; only the run that
 * lands at 9pm Adelaide time proceeds unless --force is passed.
 * Env: BLOG_AGENT_BASE_URL, BLOG_AGENT_TOKEN, OPENAI_API_KEY, GSC_SERVICE_ACCOUNT_JSON, GSC_SITE_URL.
 */
import "dotenv/config";
import { tieredOpportunityReport } from "../../src/lib/gsc/tiered-report";
import { recommendationsBatchSchema } from "../../src/lib/blog/recommendation-schemas";
import { appGet, appPost, reportFailure } from "./api";
import { askJson } from "./openai";
import { adelaideHour, agentDoc, knowledgeBaseSource, recentCommits, todayInAdelaide } from "./repo-context";

const PLAN_HOUR = 21;

const OUTPUT_CONTRACT = `Return only a json object:
{
  "summary": string (2-3 sentences on tonight's picks and why),
  "recommendations": [ exactly 10 items: {
    "title": string, "angle": string (what the post covers and for whom),
    "targetPostSlug": string | null (only for updates to a published DB post),
    "section": "NEWS" | "GUIDE",
    "source": "GSC" | "KNOWLEDGE_BASE" | "FEATURE" | "MARKET" | "NEWS",
    "whyNow": string (the evidence: impressions/position, news date, feature commit),
    "score": integer 0-100,
    "targetQueries": [{ "query": string, "impressions": number, "position": number, "page": string }],
    "sourceUrls": [string],
    "timeSensitive": boolean
  } ]
}`;

async function gscReport(): Promise<unknown> {
  try {
    return await tieredOpportunityReport(25);
  } catch (error) {
    console.error("Search Console report failed; planning without it", error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

async function main() {
  if (!process.argv.includes("--force") && adelaideHour() !== PLAN_HOUR) {
    console.log(`Not ${PLAN_HOUR}:00 in Adelaide (hour ${adelaideHour()}); skipping this scheduled run.`);
    return;
  }

  const [context, gsc] = await Promise.all([appGet<unknown>("/context"), gscReport()]);
  const input = JSON.stringify({
    today: todayInAdelaide(),
    blogContext: context,
    searchConsole: gsc,
    commits: recentCommits(7),
    knowledgeBase: knowledgeBaseSource(),
  });

  const raw = await askJson({
    instructions: `You are the evening planner for Vendl's blog. Follow this playbook exactly.\n\n${agentDoc("PLAYBOOK")}\n\n${OUTPUT_CONTRACT}`,
    input: `Plan tomorrow's 10 recommendations from this json context. Use web search for news from the last 72 hours.\n${input}`,
    webSearch: true,
    maxOutputTokens: 16_000,
  });
  const parsed = recommendationsBatchSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Planner output failed validation: ${JSON.stringify(parsed.error.issues).slice(0, 1500)}`);
  }

  const result = await appPost<{ topics: Array<{ id: string; title: string; rank: number | null }> }>(
    "/recommendations",
    parsed.data,
  );
  for (const topic of result.topics) console.log(`#${topic.rank} ${topic.title} (${topic.id})`);
}

main().catch(async (error: unknown) => {
  console.error(error);
  await reportFailure("Blog planner failed tonight", error);
  process.exit(1);
});
