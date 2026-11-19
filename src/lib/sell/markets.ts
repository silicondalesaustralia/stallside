import { MARKET_SEEDS } from "./registry";
import { buildMarket } from "./build-market";
import type { SellMarket } from "./types";

const ALL_MARKETS: SellMarket[] = MARKET_SEEDS.map(buildMarket);

const BY_SLUG = new Map(ALL_MARKETS.map((m) => [m.slug, m]));

export function normalizeQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchesMarket(market: SellMarket, q: string): boolean {
  if (!q) return false;
  const haystack = [
    market.slug.replace(/-/g, " "),
    market.label,
    ...market.aliases,
  ]
    .map(normalizeQuery)
    .join(" ");
  if (haystack.includes(q)) return true;
  const tokens = q.split(" ").filter(Boolean);
  return tokens.every((t) => haystack.includes(t));
}

export function getAllMarkets(): SellMarket[] {
  return ALL_MARKETS;
}

export function getPublishedMarkets(): SellMarket[] {
  return ALL_MARKETS.filter((m) => m.status === "published");
}

export function getMarket(slug: string): SellMarket | undefined {
  return BY_SLUG.get(slug);
}

export function getMarketsByCategory(categoryId: string): SellMarket[] {
  return ALL_MARKETS.filter((m) => m.categoryId === categoryId);
}

export function searchMarkets(query: string): SellMarket[] {
  const q = normalizeQuery(query);
  if (!q) return [];
  return ALL_MARKETS.filter((m) => matchesMarket(m, q));
}
