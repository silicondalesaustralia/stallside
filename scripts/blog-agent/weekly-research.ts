import { runAiVisibilityCheck } from "./ai-visibility";
import { runCommunityScan } from "./community-scan";
import { runCompetitorScan } from "./competitor-scan";
import { adelaideWeekday } from "./repo-context";

const WEEKLY_RESEARCH_DAY = "Sunday";

export function isWeeklyResearchNight(): boolean {
  return process.argv.includes("--weekly") || adelaideWeekday() === WEEKLY_RESEARCH_DAY;
}

/** Competitor, community and AI-answer research in parallel; each part is optional and never throws. */
export async function runWeeklyResearch(existingTitles: string[]) {
  const [competitorScan, communityScan, aiVisibility] = await Promise.all([
    runCompetitorScan(existingTitles),
    runCommunityScan(existingTitles),
    runAiVisibilityCheck(),
  ]);
  return { competitorScan, communityScan, aiVisibility };
}
