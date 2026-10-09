"use server";

import { requireOwner } from "@/lib/session";
import { domainSearchEnabled } from "@/lib/domains/config";
import { searchLaunchDomains } from "@/lib/domains/registrar/search";
import type { DomainSearchHit } from "@/lib/domains/registrar/search";
import { parseDomainRetailCurrency } from "@/lib/domains/registrar/retail-pricing";
import type { BillingCurrency } from "@/lib/saas-pricing";

export type SearchDomainState = {
  query: string;
  currency: BillingCurrency;
  hits: DomainSearchHit[];
  error?: string;
};

export async function searchDomainsAction(
  prev: SearchDomainState,
  formData: FormData,
): Promise<SearchDomainState> {
  await requireOwner();
  const query = String(formData.get("query") ?? "").trim();
  const currency = parseDomainRetailCurrency(
    String(formData.get("currency") ?? prev.currency ?? "AUD"),
    prev.currency || "AUD",
  );
  if (!domainSearchEnabled()) {
    return {
      query,
      currency,
      hits: [],
      error: "Domain search is not enabled yet.",
    };
  }
  try {
    const hits = await searchLaunchDomains(query, currency);
    return { query, currency, hits };
  } catch (e) {
    return {
      query,
      currency,
      hits: [],
      error: e instanceof Error ? e.message : "Search failed",
    };
  }
}
