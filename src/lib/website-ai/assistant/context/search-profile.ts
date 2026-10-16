import { DAY_IDS, parseBusinessProfile } from "@/lib/seo/business-profile";
import { BUSINESS_TYPES } from "@/lib/seo/business-types";
import { hasUsefulSearchProfile } from "@/lib/seo/search-profile-status";

/** Seller-entered Google & search profile facts the assistant may use. Read only. */
export type SearchProfileFacts = {
  complete: boolean;
  businessType: string | null;
  location: string | null;
  /** Suburb or town only. */
  locality: string | null;
  areaServed: string[];
  hours: string[];
  knownFor: string[];
  awards: string[];
  certifications: string[];
  memberOf: string[];
  founded: string | null;
  paymentAccepted: string[];
  returns: string | null;
  description: string | null;
};

const DAY_LABELS: Record<(typeof DAY_IDS)[number], string> = {
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
};

export function searchProfileFacts(raw: unknown): SearchProfileFacts {
  const p = parseBusinessProfile(raw);
  const a = p.address;
  const street = p.showStreetAddress ? a?.street : undefined;
  const location = [street, a?.locality, a?.region, a?.postcode].filter(Boolean).join(", ") || null;
  const hours = DAY_IDS.flatMap((day) => {
    const h = p.hours?.[day];
    return h ? [`${DAY_LABELS[day]} ${h.opens}–${h.closes}`] : [];
  });
  const r = p.returnPolicy;
  const returns = r
    ? r.accepted
      ? `Returns accepted${r.days ? ` within ${r.days} days` : ""}${r.freeReturns ? ", free returns" : ""}`
      : "Returns not accepted"
    : null;
  return {
    complete: hasUsefulSearchProfile(p),
    businessType: p.businessType ? BUSINESS_TYPES[p.businessType].label : null,
    location,
    locality: a?.locality ?? null,
    areaServed: p.areaServed ?? [],
    hours,
    knownFor: p.knowsAbout ?? [],
    awards: p.awards ?? [],
    certifications: p.certifications ?? [],
    memberOf: p.memberOf ?? [],
    founded: p.foundingDate ?? null,
    paymentAccepted: p.paymentAccepted ?? [],
    returns,
    description: p.description ?? null,
  };
}

/** Short list of what the profile contributes, for the wizard. */
export function searchProfileSummary(f: SearchProfileFacts): string[] {
  const out: string[] = [];
  if (f.businessType) out.push(`Business type: ${f.businessType}`);
  if (f.location) out.push(`Location: ${f.location}`);
  if (f.hours.length > 0) out.push("Opening hours");
  if (f.knownFor.length > 0) out.push(`Known for: ${f.knownFor.slice(0, 3).join(", ")}`);
  if (f.awards.length + f.certifications.length > 0) out.push("Awards & certifications");
  if (f.returns) out.push("Returns policy");
  return out;
}
