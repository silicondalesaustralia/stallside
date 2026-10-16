import { DAY_IDS, parseBusinessProfile } from "@/lib/seo/business-profile";
import type { StudioMetadata } from "./types";

type VisitFacts = Pick<StudioMetadata, "standHours" | "directionsUrl" | "locality">;

/** Hours, directions and suburb for hero and visit sections. The street address stays private unless shown. */
export function visitFacts(rawProfile: unknown, timeZone: string, regionLabel: string | null): VisitFacts {
  const p = parseBusinessProfile(rawProfile);
  const hours = p.hours && DAY_IDS.some((d) => p.hours?.[d]) ? p.hours : null;
  const a = p.address;
  const street = p.showStreetAddress ? a?.street : undefined;
  const query = [street, a?.locality, a?.region, a?.postcode].filter(Boolean).join(", ") || regionLabel;
  return {
    standHours: hours ? { hours, timeZone } : null,
    directionsUrl:
      p.mapUrl ?? p.googleBusinessProfileUrl ?? (query ? `https://maps.google.com/?q=${encodeURIComponent(query)}` : null),
    locality: a?.locality ?? null,
  };
}
