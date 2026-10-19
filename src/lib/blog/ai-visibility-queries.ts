import { prisma } from "@/lib/prisma";
import { aiCitationSchema, type AiCitation } from "./ai-visibility-schema";

export type AiVisibilityRunSummary = {
  runAt: Date;
  total: number;
  mentioned: number;
  cited: number;
  competitorMentions: Array<{ name: string; count: number }>;
};

export type AiVisibilityQuestionRow = {
  id: string;
  question: string;
  answerExcerpt: string;
  vendlMentioned: boolean;
  vendlCited: boolean;
  competitorsMentioned: string[];
  citations: AiCitation[];
  previouslyMentioned: boolean | null;
};

function parseCitations(value: unknown): AiCitation[] {
  const parsed = aiCitationSchema.array().safeParse(value);
  return parsed.success ? parsed.data : [];
}

function countBy(values: string[]): Array<{ name: string; count: number }> {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

/** Last N weekly runs (newest first), the latest run's questions, and its most-cited domains. */
export async function loadAiVisibility(runLimit = 12) {
  const runTimes = await prisma.blogAiVisibilityCheck.findMany({
    distinct: ["runAt"],
    orderBy: { runAt: "desc" },
    take: runLimit,
    select: { runAt: true },
  });
  if (runTimes.length === 0) return { runs: [], latest: [], topDomains: [] };

  const rows = await prisma.blogAiVisibilityCheck.findMany({
    where: { runAt: { in: runTimes.map((r) => r.runAt) } },
    orderBy: { question: "asc" },
  });

  const runs: AiVisibilityRunSummary[] = runTimes.map(({ runAt }) => {
    const inRun = rows.filter((row) => row.runAt.getTime() === runAt.getTime());
    return {
      runAt,
      total: inRun.length,
      mentioned: inRun.filter((row) => row.vendlMentioned).length,
      cited: inRun.filter((row) => row.vendlCited).length,
      competitorMentions: countBy(inRun.flatMap((row) => row.competitorsMentioned)),
    };
  });

  const [latestRun, previousRun] = runTimes;
  const previous = new Map(
    rows.filter((row) => previousRun && row.runAt.getTime() === previousRun.runAt.getTime()).map((row) => [row.question, row.vendlMentioned]),
  );
  const latest: AiVisibilityQuestionRow[] = rows
    .filter((row) => row.runAt.getTime() === latestRun.runAt.getTime())
    .map((row) => ({
      id: row.id,
      question: row.question,
      answerExcerpt: row.answerExcerpt,
      vendlMentioned: row.vendlMentioned,
      vendlCited: row.vendlCited,
      competitorsMentioned: row.competitorsMentioned,
      citations: parseCitations(row.citations),
      previouslyMentioned: previous.get(row.question) ?? null,
    }));

  const topDomains = countBy(latest.flatMap((row) => [...new Set(row.citations.map((c) => c.domain))])).slice(0, 15);
  return { runs, latest, topDomains };
}
