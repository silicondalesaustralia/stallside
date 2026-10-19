import type { GscRow } from "./search-analytics";

export type GscPageKind = "post" | "landing" | "home" | "excluded";

export type GscOpportunity = {
  page: string;
  path: string;
  pageKind: GscPageKind;
  totalImpressions: number;
  totalClicks: number;
  bestPosition: number;
  score: number;
  queries: Array<{ query: string; impressions: number; clicks: number; position: number }>;
};

export type OpportunityOptions = {
  minImpressions: number;
  minPosition: number;
  maxPosition: number;
  brandTerms: string[];
};

export const DEFAULT_OPPORTUNITY_OPTIONS: OpportunityOptions = {
  minImpressions: 20,
  minPosition: 8,
  maxPosition: 40,
  brandTerms: ["vendl", "stallside"],
};

/** Low-traffic fallback: longer window, thinner signals, deeper positions. */
export const LOOSE_OPPORTUNITY_OPTIONS: OpportunityOptions = {
  ...DEFAULT_OPPORTUNITY_OPTIONS,
  minImpressions: 5,
  maxPosition: 70,
};

export function classifyPath(path: string): GscPageKind {
  if (path === "/" || path === "") return "home";
  if (/^\/(s|dashboard|admin|api|checkout|login|signup|onboarding|c)(\/|$)/.test(path)) return "excluded";
  if (/^\/(farms-stand-news|guides)\/[^/]+/.test(path)) return "post";
  return "landing";
}

/** Closer to page 1 + more impressions = higher score. Position 11 scores ~2x position 30. */
function queryScore(impressions: number, position: number) {
  return impressions / Math.max(1, position - 7);
}

/** Group "striking distance" queries by the page Google currently ranks for them. */
export function findOpportunities(
  rows: GscRow[],
  options: OpportunityOptions = DEFAULT_OPPORTUNITY_OPTIONS,
): GscOpportunity[] {
  const brand = new RegExp(options.brandTerms.join("|"), "i");
  const byPage = new Map<string, GscOpportunity>();

  for (const row of rows) {
    if (row.impressions < options.minImpressions) continue;
    if (row.position < options.minPosition || row.position > options.maxPosition) continue;
    if (brand.test(row.query)) continue;
    const path = new URL(row.page).pathname.replace(/\/$/, "") || "/";
    const pageKind = classifyPath(path);
    if (pageKind === "excluded") continue;

    const entry =
      byPage.get(row.page) ??
      ({ page: row.page, path, pageKind, totalImpressions: 0, totalClicks: 0, bestPosition: 999, score: 0, queries: [] } satisfies GscOpportunity);
    entry.totalImpressions += row.impressions;
    entry.totalClicks += row.clicks;
    entry.bestPosition = Math.min(entry.bestPosition, row.position);
    entry.score += queryScore(row.impressions, row.position);
    entry.queries.push({
      query: row.query,
      impressions: row.impressions,
      clicks: row.clicks,
      position: Math.round(row.position * 10) / 10,
    });
    byPage.set(row.page, entry);
  }

  return [...byPage.values()]
    .map((o) => ({
      ...o,
      score: Math.round(o.score * 10) / 10,
      queries: o.queries.sort((a, b) => b.impressions - a.impressions).slice(0, 25),
    }))
    .sort((a, b) => b.score - a.score);
}
