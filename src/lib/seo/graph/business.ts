import { BUSINESS_TYPES, defaultBusinessType } from "../business-types";
import { DAY_IDS, type BusinessProfile, type DayId } from "../business-profile";
import type { SiteFacts } from "../site-facts";
import { countryFor, graphIds, type JsonLdNode } from "./clean";

const DAY_NAMES: Record<DayId, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

/** Days with the same opening times share one OpeningHoursSpecification, as Google recommends. */
export function openingHours(hours: BusinessProfile["hours"]): JsonLdNode[] {
  if (!hours) return [];
  const groups = new Map<string, string[]>();
  for (const day of DAY_IDS) {
    const h = hours[day];
    if (!h) continue;
    const key = `${h.opens}-${h.closes}`;
    groups.set(key, [...(groups.get(key) ?? []), DAY_NAMES[day]]);
  }
  return [...groups.entries()].map(([key, days]) => {
    const [opens, closes] = key.split("-");
    return { "@type": "OpeningHoursSpecification", dayOfWeek: days, opens, closes };
  });
}

function postalAddress(facts: SiteFacts): JsonLdNode | undefined {
  const a = facts.profile.address;
  const locality = a?.locality ?? facts.regionLabel ?? undefined;
  if (!a && !locality) return undefined;
  return {
    "@type": "PostalAddress",
    streetAddress: facts.profile.showStreetAddress ? a?.street : undefined,
    addressLocality: locality,
    addressRegion: a?.region,
    postalCode: a?.postcode,
    addressCountry: a?.country ?? countryFor(facts.currency),
  };
}

export function uniqueUrls(urls: (string | null | undefined)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of urls) {
    const u = raw?.trim();
    if (!u || !/^https?:\/\//.test(u)) continue;
    const key = u.replace(/\/+$/, "").toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(u);
  }
  return out;
}

/** The business: an Organization, or a LocalBusiness subtype with address, hours and map for local sellers. */
export function businessNode(facts: SiteFacts): JsonLdNode {
  const p = facts.profile;
  const ids = graphIds(facts.homeUrl, facts.homeUrl);
  const type = BUSINESS_TYPES[p.businessType ?? defaultBusinessType(facts.businessMode)];
  const local = type.local;
  const phone = p.phone ?? facts.phone ?? undefined;
  const email = p.email ?? facts.email ?? undefined;
  return {
    "@type": type.schemaType,
    "@id": ids.business,
    name: facts.name,
    legalName: p.legalName,
    alternateName: p.alternateNames,
    slogan: p.slogan,
    description: p.description ?? facts.description ?? undefined,
    url: facts.homeUrl,
    logo: facts.logoUrl ? { "@type": "ImageObject", "@id": ids.logo, url: facts.logoUrl, contentUrl: facts.logoUrl } : undefined,
    image: facts.imageUrl ?? facts.logoUrl ?? undefined,
    email,
    telephone: phone,
    address: postalAddress(facts),
    geo: local && p.geo ? { "@type": "GeoCoordinates", latitude: p.geo.lat, longitude: p.geo.lng } : undefined,
    hasMap: local ? (p.mapUrl ?? p.googleBusinessProfileUrl) : undefined,
    openingHoursSpecification: local ? openingHours(p.hours) : undefined,
    areaServed: p.areaServed?.map((name) => ({ "@type": "Place", name })),
    priceRange: local ? p.priceRange : undefined,
    paymentAccepted: local ? p.paymentAccepted?.join(", ") : undefined,
    currenciesAccepted: local ? facts.currency : undefined,
    foundingDate: p.foundingDate,
    taxID: p.taxId,
    knowsAbout: p.knowsAbout,
    award: p.awards,
    hasCredential: p.certifications?.map((name) => ({ "@type": "EducationalOccupationalCredential", name })),
    memberOf: p.memberOf?.map((name) => ({ "@type": "Organization", name })),
    founder: p.founder ? { "@id": ids.founder } : undefined,
    contactPoint: phone || email ? { "@type": "ContactPoint", contactType: "customer service", telephone: phone, email } : undefined,
    sameAs: uniqueUrls([p.googleBusinessProfileUrl, ...(p.sameAs ?? []), ...facts.socialUrls]),
  };
}

/** The founder / owner as a Person; also the author of blog posts. */
export function founderNode(facts: SiteFacts): JsonLdNode | null {
  const f = facts.profile.founder;
  if (!f) return null;
  const ids = graphIds(facts.homeUrl, facts.homeUrl);
  return {
    "@type": "Person",
    "@id": ids.founder,
    name: f.name,
    jobTitle: f.jobTitle,
    description: f.description,
    image: f.imageUrl,
    sameAs: uniqueUrls(f.sameAs ?? []),
    worksFor: { "@id": ids.business },
  };
}
