import { AU_LOCATION, dfsTask } from "./dataforseo";

export type KeywordMetrics = { volume: number | null; difficulty: number | null; intent: string | null };
export type KeywordVariation = { keyword: string; volume: number };

type OverviewItem = {
  keyword?: string;
  keyword_info?: { search_volume?: number | null };
  keyword_properties?: { keyword_difficulty?: number | null };
  search_intent_info?: { main_intent?: string | null };
};
type RelatedItem = { keyword_data?: { keyword?: string; keyword_info?: { search_volume?: number | null } } };

/** Monthly Google Australia searches, difficulty (0-100) and intent, keyed by lowercase keyword. */
export async function keywordOverview(keywords: string[]): Promise<Map<string, KeywordMetrics>> {
  const unique = [...new Set(keywords.map((k) => k.trim().toLowerCase()).filter(Boolean))].slice(0, 700);
  const metrics = new Map<string, KeywordMetrics>();
  if (unique.length === 0) return metrics;
  const result = await dfsTask<{ items?: OverviewItem[] }>("dataforseo_labs/google/keyword_overview/live", {
    keywords: unique,
    ...AU_LOCATION,
  });
  for (const item of result?.items ?? []) {
    if (!item.keyword) continue;
    metrics.set(item.keyword.toLowerCase(), {
      volume: item.keyword_info?.search_volume ?? null,
      difficulty: item.keyword_properties?.keyword_difficulty ?? null,
      intent: item.search_intent_info?.main_intent ?? null,
    });
  }
  return metrics;
}

export type DemandKeyword = KeywordMetrics & { keyword: string };

/** Real searches containing each seed phrase (volume >= 10), merged and sorted by volume. */
export async function keywordSuggestions(seeds: string[], perSeed = 20): Promise<DemandKeyword[]> {
  const results = await Promise.all(
    seeds.map((seed) =>
      dfsTask<{ items?: OverviewItem[] }>("dataforseo_labs/google/keyword_suggestions/live", {
        keyword: seed,
        ...AU_LOCATION,
        limit: perSeed,
        filters: ["keyword_info.search_volume", ">=", 10],
        order_by: ["keyword_info.search_volume,desc"],
      }),
    ),
  );
  const byKeyword = new Map<string, DemandKeyword>();
  for (const item of results.flatMap((r) => r?.items ?? [])) {
    if (!item.keyword || byKeyword.has(item.keyword)) continue;
    byKeyword.set(item.keyword, {
      keyword: item.keyword,
      volume: item.keyword_info?.search_volume ?? null,
      difficulty: item.keyword_properties?.keyword_difficulty ?? null,
      intent: item.search_intent_info?.main_intent ?? null,
    });
  }
  return [...byKeyword.values()].sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));
}

/** Searches related to the seed with measurable volume, highest first. */
export async function relatedKeywords(seed: string, limit = 20): Promise<KeywordVariation[]> {
  const result = await dfsTask<{ items?: RelatedItem[] }>("dataforseo_labs/google/related_keywords/live", {
    keyword: seed,
    ...AU_LOCATION,
    depth: 1,
    limit: 50,
  });
  return (result?.items ?? [])
    .map((item) => ({ keyword: item.keyword_data?.keyword ?? "", volume: item.keyword_data?.keyword_info?.search_volume ?? 0 }))
    .filter((item) => item.keyword && item.volume > 0)
    .sort((a, b) => b.volume - a.volume)
    .slice(0, limit);
}
