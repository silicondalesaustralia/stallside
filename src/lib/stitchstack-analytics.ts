import { STITCHSTACK_APP_URL } from "@/lib/stitchstack";
import type { RangeKey } from "@/lib/date-range";

export type StitchstackAnalyticsSnapshot = {
  ok: true;
  stitchstack_org_id: string;
  has_hits: boolean;
  first_hit_at: string | null;
  range_label: string;
  kpis: {
    pageviews: number;
    sessions: number;
    visitors: number;
    pagesPerSession: number;
  };
  previous_kpis: {
    pageviews: number;
    sessions: number;
    visitors: number;
    pagesPerSession: number;
  } | null;
  daily: Array<{ date: string; sessions: number; pageviews: number }>;
  top_pages: Array<{ path: string; pageviews: number }>;
  top_referrers: Array<{ referrer: string; sessions: number }>;
  top_sources: Array<{ source: string; sessions: number }>;
};

function partnerApiKey(): string | null {
  return process.env.STITCHSTACK_PARTNER_API_KEY?.trim() || process.env.VENDL_PARTNER_API_KEY?.trim() || null;
}

/** Map Vendl dashboard range keys onto Stitchstack presets. */
export function toStitchstackRange(key: RangeKey): string {
  if (key === "6m" || key === "12m" || key === "all" || key === "custom") return key;
  if (key === "today" || key === "yesterday") return key;
  return key;
}

/** Pull pixel analytics from Stitchstack for the Vendl home dashboard mirror. */
export async function fetchStitchstackAnalytics(input: {
  externalAccountId: string;
  range: RangeKey;
  fromParam: string;
  toParam: string;
}): Promise<StitchstackAnalyticsSnapshot | null> {
  const apiKey = partnerApiKey();
  if (!apiKey) return null;

  const range = toStitchstackRange(input.range);
  const body: Record<string, string> = {
    external_account_id: input.externalAccountId,
    range,
    comparison: "previous",
  };
  if (range === "custom") {
    body.custom_from = input.fromParam;
    body.custom_to = input.toParam;
  }

  try {
    const response = await fetch(`${STITCHSTACK_APP_URL}/api/partners/vendl/analytics`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const json = (await response.json()) as StitchstackAnalyticsSnapshot;
    if (!json?.ok) return null;
    return json;
  } catch {
    return null;
  }
}
