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
  const out: Record<string, string> = {};
  if (au.eligibilityId) out[`${prefix}RegistrantId`] = au.eligibilityId;
  if (au.eligibilityIdType) {
    out[`${prefix}RegistrantIdType`] = au.eligibilityIdType;
  }
  return out;
}

export function domainTld(domain: string): string {
  return domain.trim().toLowerCase().split(".").slice(1).join(".");
}
