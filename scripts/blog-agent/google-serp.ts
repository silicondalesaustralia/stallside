import { AU_LOCATION, dfsTask } from "./dataforseo";

type SerpItem = {
  type?: string;
  rank_group?: number;
  url?: string;
  domain?: string;
  title?: string;
  description?: string;
  items?: Array<{ title?: string } | string>;
  references?: Array<{ url?: string; title?: string; domain?: string }>;
};

export type GoogleSerp = {
  keyword: string;
  organic: Array<{ rank: number; url: string; domain: string; title: string; description: string }>;
  peopleAlsoAsk: string[];
  relatedSearches: string[];
  aiOverview: { present: boolean; citedPages: Array<{ url: string; title: string; domain: string }> };
};

function texts(items: SerpItem["items"]): string[] {
  return (items ?? [])
    .map((item) => (typeof item === "string" ? item : item.title ?? ""))
    .filter(Boolean);
}

/** Live Google Australia results: top 10 organic, People also ask, related searches and AI Overview sources. */
export async function googleSerp(keyword: string): Promise<GoogleSerp | null> {
  const result = await dfsTask<{ items?: SerpItem[] }>("serp/google/organic/live/advanced", {
    keyword,
    ...AU_LOCATION,
    depth: 10,
  });
  if (!result) return null;
  const items = result.items ?? [];
  const ai = items.find((item) => item.type === "ai_overview");
  return {
    keyword,
    organic: items
      .filter((item) => item.type === "organic" && item.url)
      .slice(0, 10)
      .map((item) => ({
        rank: item.rank_group ?? 0,
        url: item.url ?? "",
        domain: item.domain ?? "",
        title: item.title ?? "",
        description: item.description ?? "",
      })),
    peopleAlsoAsk: items.filter((item) => item.type === "people_also_ask").flatMap((item) => texts(item.items)),
    relatedSearches: items.filter((item) => item.type === "related_searches").flatMap((item) => texts(item.items)),
    aiOverview: {
      present: Boolean(ai),
      citedPages: (ai?.references ?? [])
        .filter((ref) => ref.url)
        .slice(0, 10)
        .map((ref) => ({ url: ref.url ?? "", title: ref.title ?? "", domain: ref.domain ?? "" })),
    },
  };
}
