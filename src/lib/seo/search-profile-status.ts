import type { BusinessProfile } from "./business-profile";

/** Enough for useful local markup: a chosen business type plus a Google profile link or an address. */
export function hasUsefulSearchProfile(profile: BusinessProfile): boolean {
  return Boolean(profile.businessType && (profile.googleBusinessProfileUrl || profile.address?.locality));
}
