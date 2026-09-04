"use server";

import { requireOwner } from "@/lib/session";
import { domainSearchEnabled } from "@/lib/domains/config";
import { searchLaunchDomains } from "@/lib/domains/registrar/search";
import type { DomainSearchHit } from "@/lib/domains/registrar/search";

export type SearchDomainState = {
  query: string;
  hits: DomainSearchHit[];
  error?: string;
};

export async function searchDomainsAction(
  _prev: SearchDomainState,
  formData: FormData,
): Promise<SearchDomainState> {
  await requireOwner();
  const query = String(formData.get("query") ?? "").trim();
  if (!domainSearchEnabled()) {
    return { query, hits: [], error: "Domain search is not enabled yet." };
  }
  try {
    const hits = await searchLaunchDomains(query);
    return { query, hits };
  } catch (e) {
    return {
      query,
      hits: [],
      error: e instanceof Error ? e.message : "Search failed",
    };
  }
}
