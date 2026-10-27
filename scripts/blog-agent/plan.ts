/**
 * Evening planner (9pm Adelaide daily): recommend 5 ranked ideas for tomorrow's article and email
 * them with "Write this" links.
 *
 *   npx tsx scripts/blog-agent/plan.ts [--force] [--weekly]
 *
 * Sundays (or --weekly) first run the competitor scan, community scan and ChatGPT visibility check.
 *
 * Started at 9pm Adelaide by the app's Vercel cron (/api/cron/blog-plan), which dispatches the
 * workflow with --force. Without --force it only proceeds at 9pm Adelaide time.
 * Env: BLOG_AGENT_BASE_URL, BLOG_AGENT_TOKEN, OPENAI_API_KEY, GSC_SERVICE_ACCOUNT_JSON, GSC_SITE_URL,
 * optional DATAFORSEO_LOGIN/DATAFORSEO_PASSWORD (or DATAFORSEO_RELAY_URL/DATAFORSEO_RELAY_SECRET).
 */
import "dotenv/config";
import { tieredOpportunityReport } from "../../src/lib/gsc/tiered-report";
import { IDEAS_PER_BATCH, recommendationsBatchSchema } from "../../src/lib/blog/recommendation-schemas";
import { appGet, appPost, reportFailure } from "./api";
import { existingTitles, plannerContext, type BlogContext } from "./compact-context";
import { knowledgeIndex } from "./knowledge-select";
import { askJson } from "./openai";
import { adelaideHour, playbookFor, recentCommits, todayInAdelaide } from "./repo-context";
import { searchDemandPool } from "./search-demand";
import { addSearchVolumes } from "./search-volume";
import { isWeeklyResearchNight, runWeeklyResearch } from "./weekly-research";

const PLAN_HOUR = 21;

const OUTPUT_CONTRACT = `Return only a json object:
{
  "summary": string (2-3 sentences on tonight's picks and why),
  "recommendations": [ exactly ${IDEAS_PER_BATCH} items: {
    "title": string, "angle": string (what the post covers and for whom),
    "targetPostSlug": string | null (only for updates to a published DB post),
    "section": "NEWS" | "GUIDE",
    "source": "GSC" | "KNOWLEDGE_BASE" | "FEATURE" | "MARKET" | "NEWS" | "COMPETITOR" | "COMMUNITY" | "AI_ANSWERS",
    "whyNow": string (the evidence: impressions/position, news date, feature commit),
    "vendlTieIn": string (the named Vendl feature(s) from the knowledge base that solve the reader's problem, and the signup hook),
    "score": integer 0-100,
    "targetQueries": [2-5 items: { "query": string, "impressions": number, "position": number, "page": string }] (always: the searches a reader would type for this post, main one first; 2-5 words as typed into Google, no "Australia" suffix, no brand names; prefer exact queries from searchDemand when they fit the post; impressions/position/page only for Search Console queries),
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

  const [context, gsc, searchDemand] = await Promise.all([
    appGet<BlogContext>("/context"),
    gscReport(),
    searchDemandPool(),
  ]);
  const weeklyResearch = isWeeklyResearchNight() ? await runWeeklyResearch(existingTitles(context)) : null;
  const input = JSON.stringify({
    today: todayInAdelaide(),
    blogContext: plannerContext(context),
    searchConsole: gsc,
    ...(searchDemand.length ? { searchDemand } : {}),
    ...weeklyResearch,
    commits: recentCommits(7),
    knowledgeBase: await knowledgeIndex(),
  });

  const raw = await askJson({
    task: "PLAN",
    instructions: `You are the evening planner for Vendl's blog. Follow this playbook exactly.\n\n${playbookFor("PLAN")}\n\n${OUTPUT_CONTRACT}`,
    input: `Plan tomorrow's ${IDEAS_PER_BATCH} recommendations (Jono picks one) from this json context. Use web search for news from the last 72 hours.\n${input}`,
    webSearch: true,
    maxOutputTokens: 16_000,
  });
  const parsed = recommendationsBatchSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Planner output failed validation: ${JSON.stringify(parsed.error.issues).slice(0, 1500)}`);
  }
  const top = [...parsed.data.recommendations].sort((a, b) => b.score - a.score).slice(0, IDEAS_PER_BATCH);

  const result = await appPost<{ topics: Array<{ id: string; title: string; rank: number | null }> }>(
    "/recommendations",
    await addSearchVolumes({ ...parsed.data, recommendations: top }),
  );
  for (const topic of result.topics) console.log(`#${topic.rank} ${topic.title} (${topic.id})`);
}

main().catch(async (error: unknown) => {
  console.error(error);
  await reportFailure("Blog planner failed tonight", error);
  process.exit(1);
});
