import type { BusinessProfile } from "./business-profile";
import { countryFor } from "./graph/clean";

export type PickupForPrefill = {
  addressLine1: string | null;
  suburb: string | null;
  stateTerritory: string | null;
  postcode: string | null;
  latitude: number | null;
  longitude: number | null;
};

/** Suggests address and map pin from the first pickup location until the seller saves their own. */
export function withPickupPrefill(
  profile: BusinessProfile,
  pickup: PickupForPrefill | null,
  currency: string,
): BusinessProfile {
  if (!pickup || profile.address) return profile;
  return {
    ...profile,
    address: {
      street: pickup.addressLine1 ?? undefined,
      locality: pickup.suburb ?? undefined,
      region: pickup.stateTerritory ?? undefined,
      postcode: pickup.postcode ?? undefined,
      country: countryFor(currency),
    },
    geo:
      profile.geo ??
      (pickup.latitude != null && pickup.longitude != null ? { lat: pickup.latitude, lng: pickup.longitude } : undefined),
  };
}
