/**
 * Search Console "striking distance" report for the daily blog agent.
 *
 *   npx tsx scripts/gsc-opportunities.ts [--days 28] [--out gsc-opportunities.json]
 *
 * Env: GSC_SERVICE_ACCOUNT_JSON (or GOOGLE_APPLICATION_CREDENTIALS), GSC_SITE_URL.
 */
import "dotenv/config";
import { writeFileSync } from "fs";
import { getServiceAccountAccessToken } from "../src/lib/gsc/service-account-token";
import { fetchQueryPageRows, gscDateWindow } from "../src/lib/gsc/search-analytics";
import { findOpportunities } from "../src/lib/gsc/opportunities";

function arg(name: string, fallback: string): string {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

async function main() {
  const siteUrl = process.env.GSC_SITE_URL?.trim() || "sc-domain:vendl.app";
  const days = Math.min(90, Math.max(7, Number(arg("days", "28")) || 28));
  const out = arg("out", "");

  const token = await getServiceAccountAccessToken();
  const window = gscDateWindow(days);
  const rows = await fetchQueryPageRows(token, siteUrl, window);
  const opportunities = findOpportunities(rows);

  const report = {
    siteUrl,
    ...window,
    totalRows: rows.length,
    opportunities: opportunities.slice(0, 40),
  };
  const json = JSON.stringify(report, null, 2);
  if (out) {
    writeFileSync(out, json);
    console.error(`Wrote ${report.opportunities.length} opportunities to ${out}`);
  } else {
    console.log(json);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
