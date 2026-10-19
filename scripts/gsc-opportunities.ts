/**
 * Search Console "striking distance" report for the daily blog agent.
 *
 *   npx tsx scripts/gsc-opportunities.ts [--out gsc.json]
 *     [--days N --min-impressions N --max-position N]   (overrides: single pass, no tiers)
 *
 * Default: strict tier (28 days, ≥20 impressions, positions 8–40). When that yields fewer than
 * MIN_STRICT_RESULTS, falls back to the loose tier (90 days, ≥5 impressions, positions 8–70),
 * so a young site still gets targets and the report tightens itself as traffic grows.
 *
 * Env: GSC_SERVICE_ACCOUNT_JSON (or GOOGLE_APPLICATION_CREDENTIALS), GSC_SITE_URL.
 */
import "dotenv/config";
import { writeFileSync } from "fs";
import { getServiceAccountAccessToken } from "../src/lib/gsc/service-account-token";
import { fetchQueryPageRows, gscDateWindow } from "../src/lib/gsc/search-analytics";
import {
  DEFAULT_OPPORTUNITY_OPTIONS,
  LOOSE_OPPORTUNITY_OPTIONS,
  findOpportunities,
  type OpportunityOptions,
} from "../src/lib/gsc/opportunities";

const MIN_STRICT_RESULTS = 5;

function numArg(name: string): number | undefined {
  const index = process.argv.indexOf(`--${name}`);
  if (index < 0) return undefined;
  const value = Number(process.argv[index + 1]);
  return Number.isFinite(value) ? value : undefined;
}

function strArg(name: string): string {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? (process.argv[index + 1] ?? "") : "";
}

async function runTier(token: string, siteUrl: string, days: number, options: OpportunityOptions) {
  const window = gscDateWindow(days);
  const rows = await fetchQueryPageRows(token, siteUrl, window);
  return { window, days, options, totalRows: rows.length, opportunities: findOpportunities(rows, options) };
}

async function main() {
  const siteUrl = process.env.GSC_SITE_URL?.trim() || "sc-domain:vendl.app";
  const out = strArg("out");
  const token = await getServiceAccountAccessToken();

  const overrideDays = numArg("days");
  const overrideMin = numArg("min-impressions");
  const overrideMax = numArg("max-position");
  const overridden = [overrideDays, overrideMin, overrideMax].some((v) => v !== undefined);

  let tier: "custom" | "strict" | "loose";
  let result: Awaited<ReturnType<typeof runTier>>;
  if (overridden) {
    tier = "custom";
    result = await runTier(token, siteUrl, Math.min(480, Math.max(7, overrideDays ?? 28)), {
      ...DEFAULT_OPPORTUNITY_OPTIONS,
      minImpressions: overrideMin ?? DEFAULT_OPPORTUNITY_OPTIONS.minImpressions,
      maxPosition: overrideMax ?? DEFAULT_OPPORTUNITY_OPTIONS.maxPosition,
    });
  } else {
    tier = "strict";
    result = await runTier(token, siteUrl, 28, DEFAULT_OPPORTUNITY_OPTIONS);
    if (result.opportunities.length < MIN_STRICT_RESULTS) {
      tier = "loose";
      result = await runTier(token, siteUrl, 90, LOOSE_OPPORTUNITY_OPTIONS);
    }
  }

  const report = {
    siteUrl,
    tier,
    ...result.window,
    days: result.days,
    thresholds: {
      minImpressions: result.options.minImpressions,
      positions: `${result.options.minPosition}-${result.options.maxPosition}`,
    },
    totalRows: result.totalRows,
    opportunities: result.opportunities.slice(0, 40),
  };
  const json = JSON.stringify(report, null, 2);
  if (out) {
    writeFileSync(out, json);
    console.error(`[${tier}] Wrote ${report.opportunities.length} opportunities to ${out}`);
  } else {
    console.log(json);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
