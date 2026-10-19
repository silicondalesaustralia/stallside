import { getServiceAccountAccessToken } from "./service-account-token";
import { fetchQueryPageRows, gscDateWindow } from "./search-analytics";
import {
  DEFAULT_OPPORTUNITY_OPTIONS,
  LOOSE_OPPORTUNITY_OPTIONS,
  findOpportunities,
  type OpportunityOptions,
} from "./opportunities";

const MIN_STRICT_RESULTS = 5;

export async function runOpportunityTier(
  token: string,
  siteUrl: string,
  days: number,
  options: OpportunityOptions,
) {
  const window = gscDateWindow(days);
  const rows = await fetchQueryPageRows(token, siteUrl, window);
  return { window, days, options, totalRows: rows.length, opportunities: findOpportunities(rows, options) };
}

export function gscSiteUrl(): string {
  return process.env.GSC_SITE_URL?.trim() || "sc-domain:vendl.app";
}

/**
 * Strict tier (28 days, positions 8–40); falls back to the loose tier (90 days, up to 70)
 * when traffic is too thin, so a young site still gets targets.
 */
export async function tieredOpportunityReport(limit = 40) {
  const siteUrl = gscSiteUrl();
  const token = await getServiceAccountAccessToken();
  let tier: "strict" | "loose" = "strict";
  let result = await runOpportunityTier(token, siteUrl, 28, DEFAULT_OPPORTUNITY_OPTIONS);
  if (result.opportunities.length < MIN_STRICT_RESULTS) {
    tier = "loose";
    result = await runOpportunityTier(token, siteUrl, 90, LOOSE_OPPORTUNITY_OPTIONS);
  }
  return {
    siteUrl,
    tier,
    ...result.window,
    days: result.days,
    thresholds: {
      minImpressions: result.options.minImpressions,
      positions: `${result.options.minPosition}-${result.options.maxPosition}`,
    },
    totalRows: result.totalRows,
    opportunities: result.opportunities.slice(0, limit),
  };
}
