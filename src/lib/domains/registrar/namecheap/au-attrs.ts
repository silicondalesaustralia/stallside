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
  const out: Record<string, string> = {
    [`${prefix}EligibilityType`]: au.eligibilityType,
    // auDA policy reason: 1 = exact match of a trademark/name, 2 = close and substantial connection.
    [`${prefix}PolicyReason`]: idType === "TM" ? "1" : "2",
  };
  if (id) {
    out[`${prefix}RegistrantId`] = id;
    out[`${prefix}EligibilityId`] = id;
  }
  if (idType) {
    out[`${prefix}RegistrantIdType`] = idType;
    out[`${prefix}EligibilityIdType`] = idType;
  }
  if (name) {
    out[`${prefix}RegistrantName`] = name;
    out[`${prefix}EligibilityName`] = name;
  }
  // Namecheap's errors name the upstream registry fields verbatim; it ignores keys it doesn't know.
  out.eligibility_type = au.eligibilityType;
  out.policy_reason = out[`${prefix}PolicyReason`];
  if (id) out.eligibility_id = id;
  if (idType) out.eligibility_id_type = idType;
  if (name) {
    out.eligibility_name = name;
    out.registrant_name = name;
  }
  return out;
}

export function domainTld(domain: string): string {
  return domain.trim().toLowerCase().split(".").slice(1).join(".");
}
