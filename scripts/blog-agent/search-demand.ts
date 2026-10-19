import { hasDataForSeo } from "./dataforseo";
import { keywordSuggestions, type DemandKeyword } from "./keyword-data";

/** Phrases at the heart of what Vendl solves; override with BLOG_AGENT_DEMAND_SEEDS (comma-separated). */
const DEFAULT_SEEDS = [
  "farm stand",
  "honesty box",
  "roadside stall",
  "sell food from home",
  "home based food business",
  "market stall",
  "food licence",
  "selling eggs",
  "veggie box",
  "price homemade",
];

const POOL_SIZE = 150;

function seeds(): string[] {
  const custom = process.env.BLOG_AGENT_DEMAND_SEEDS?.split(",").map((s) => s.trim()).filter(Boolean);
  return custom?.length ? custom : DEFAULT_SEEDS;
}

/** Real Google Australia searches around Vendl's core topics, for the planner to choose target queries from. */
export async function searchDemandPool(): Promise<DemandKeyword[]> {
  if (!hasDataForSeo()) return [];
  const pool = (await keywordSuggestions(seeds())).slice(0, POOL_SIZE);
  console.log(`Search demand pool: ${pool.length} Google AU searches from ${seeds().length} seeds`);
  return pool;
}
