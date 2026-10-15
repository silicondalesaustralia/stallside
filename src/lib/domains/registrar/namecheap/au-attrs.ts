/** TLD eligibility → Namecheap extended attrs (keep COMAU* out of UI). */

import type { AuEligibility } from "../types";

export function namecheapAuExtendedAttrs(
  tld: string,
  au?: AuEligibility,
): Record<string, string> {
  const t = tld.toLowerCase();
  if (!au) return {};
  if (t !== "com.au" && t !== "net.au" && t !== "org.au") return {};

  const prefix = t.replace(/\./g, "").toUpperCase(); // COMAU / NETAU / ORGAU
  const id = au.eligibilityId?.replace(/[\s-]/g, "");
  const idType = au.eligibilityIdType;
  const name = au.eligibilityName?.trim();
  // Namecheap (per support): eligibility_type is the ID type (ABN/ACN/TM);
  // the legal form goes in eligibility_entity_type.
  const out: Record<string, string> = {
    eligibility_entity_type: au.eligibilityType,
  };
  if (id) {
    out[`${prefix}RegistrantId`] = id;
    out.eligibility_id = id;
  }
  if (idType) {
    out[`${prefix}RegistrantIdType`] = idType;
    out.eligibility_type = idType;
  }
  if (name) out.eligibility_name = name;
  return out;
}

export function domainTld(domain: string): string {
  return domain.trim().toLowerCase().split(".").slice(1).join(".");
}
