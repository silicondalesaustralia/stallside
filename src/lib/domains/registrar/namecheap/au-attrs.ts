/** TLD eligibility → Namecheap extended attrs (keep COMAU* out of UI). */

import type { AuEligibility } from "../types";

export function namecheapAuExtendedAttrs(
  tld: string,
  au?: AuEligibility,
): Record<string, string> {
  const t = tld.toLowerCase();
  if (!au) return {};
  if (t !== "com.au" && t !== "net.au" && t !== "org.au") return {};

  const id = au.eligibilityId?.replace(/[\s-]/g, "");
  const name = au.eligibilityName?.trim();
  // Namecheap support: only these three; the documented COMAURegistrantId/IdType
  // must not be sent alongside them. eligibility_type is the ID type, not the legal form.
  const out: Record<string, string> = {};
  if (au.eligibilityIdType) out.eligibility_type = au.eligibilityIdType;
  if (id) out.eligibility_id = id;
  if (name) out.eligibility_name = name;
  return out;
}

export function domainTld(domain: string): string {
  return domain.trim().toLowerCase().split(".").slice(1).join(".");
}
