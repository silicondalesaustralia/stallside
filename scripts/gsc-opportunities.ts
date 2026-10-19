/**
 * Search Console "striking distance" report for the blog agent.
 *
 *   npx tsx scripts/gsc-opportunities.ts [--out gsc.json]
 *     [--days N --min-impressions N --max-position N]   (overrides: single pass, no tiers)
 *
 * Default: strict tier (28 days, ≥20 impressions, positions 8–40), falling back to the loose
 * tier (90 days, ≥5 impressions, positions 8–70) on a young site. See src/lib/gsc/tiered-report.ts.
 *
 * Env: GSC_SERVICE_ACCOUNT_JSON (or GOOGLE_APPLICATION_CREDENTIALS), GSC_SITE_URL.
 */
import "dotenv/config";
import { writeFileSync } from "fs";
import { getServiceAccountAccessToken } from "../src/lib/gsc/service-account-token";
import { DEFAULT_OPPORTUNITY_OPTIONS } from "../src/lib/gsc/opportunities";
import { gscSiteUrl, runOpportunityTier, tieredOpportunityReport } from "../src/lib/gsc/tiered-report";

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

async function customReport(days: number | undefined, minImpressions: number | undefined, maxPosition: number | undefined) {
  const siteUrl = gscSiteUrl();
  const options = {
    ...DEFAULT_OPPORTUNITY_OPTIONS,
    minImpressions: minImpressions ?? DEFAULT_OPPORTUNITY_OPTIONS.minImpressions,
    maxPosition: maxPosition ?? DEFAULT_OPPORTUNITY_OPTIONS.maxPosition,
  };
  const result = await runOpportunityTier(
    await getServiceAccountAccessToken(),
    siteUrl,
    Math.min(480, Math.max(7, days ?? 28)),
    options,
  );
  return {
    siteUrl,
    tier: "custom" as const,
    ...result.window,
    days: result.days,
    thresholds: { minImpressions: options.minImpressions, positions: `${options.minPosition}-${options.maxPosition}` },
    totalRows: result.totalRows,
    opportunities: result.opportunities.slice(0, 40),
  };
}

async function main() {
  const out = strArg("out");
  const days = numArg("days");
  const minImpressions = numArg("min-impressions");
  const maxPosition = numArg("max-position");
  const overridden = [days, minImpressions, maxPosition].some((v) => v !== undefined);
  const report = overridden
    ? await customReport(days, minImpressions, maxPosition)
    : await tieredOpportunityReport();

  const json = JSON.stringify(report, null, 2);
  if (out) {
    writeFileSync(out, json);
    console.error(`[${report.tier}] Wrote ${report.opportunities.length} opportunities to ${out}`);
  } else {
    console.log(json);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
