import { DAY_IDS, businessProfileSchema, type BusinessProfile } from "./business-profile";
import { countryCode } from "./countries";

type Form = { get(name: string): FormDataEntryValue | null };

const str = (f: Form, name: string) => {
  const v = String(f.get(name) ?? "").trim();
  return v || undefined;
};
/** One item per line (commas also split, except for links). */
const lines = (f: Form, name: string, splitCommas = true) => {
  const raw = String(f.get(name) ?? "");
  const items = raw
    .split(splitCommas ? /[\n,]/ : /\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length ? [...new Set(items)] : undefined;
};
const num = (f: Form, name: string) => {
  const v = str(f, name);
  return v === undefined || Number.isNaN(Number(v)) ? undefined : Number(v);
};
const urlish = (v: string | undefined) => (v && !/^https?:\/\//i.test(v) ? `https://${v}` : v);

function hoursFrom(f: Form): BusinessProfile["hours"] {
  const out: NonNullable<BusinessProfile["hours"]> = {};
  for (const day of DAY_IDS) {
    const opens = str(f, `hours_${day}_opens`);
    const closes = str(f, `hours_${day}_closes`);
    if (opens && closes) out[day] = { opens, closes };
  }
  return Object.keys(out).length ? out : undefined;
}

function rawProfile(f: Form): Record<string, unknown> {
  const lat = num(f, "lat");
  const lng = num(f, "lng");
  const founderName = str(f, "founderName");
  const returns = str(f, "returnsAccepted");
  const address = {
    street: str(f, "street"),
    locality: str(f, "locality"),
    region: str(f, "region"),
    postcode: str(f, "postcode"),
    country: countryCode(str(f, "country")),
  };
  return {
    businessType: str(f, "businessType"),
    legalName: str(f, "legalName"),
    alternateNames: lines(f, "alternateNames"),
    slogan: str(f, "slogan"),
    description: str(f, "description"),
    foundingDate: str(f, "foundingDate"),
    taxId: str(f, "taxId"),
    address: address.street || address.locality || address.region || address.postcode ? address : undefined,
    showStreetAddress: f.get("showStreetAddress") === "on" || undefined,
    geo: lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
    areaServed: lines(f, "areaServed"),
    phone: str(f, "phone"),
    email: str(f, "email"),
    hours: hoursFrom(f),
    googleBusinessProfileUrl: urlish(str(f, "googleBusinessProfileUrl")),
    mapUrl: urlish(str(f, "mapUrl")),
    sameAs: lines(f, "sameAs", false)?.map((u) => urlish(u) as string),
    knowsAbout: lines(f, "knowsAbout"),
    priceRange: str(f, "priceRange"),
    paymentAccepted: lines(f, "paymentAccepted"),
    founder: founderName
      ? {
          name: founderName,
          jobTitle: str(f, "founderJobTitle"),
          description: str(f, "founderDescription"),
          imageUrl: urlish(str(f, "founderImageUrl")),
          sameAs: lines(f, "founderSameAs", false)?.map((u) => urlish(u) as string),
        }
      : undefined,
    awards: lines(f, "awards", false),
    certifications: lines(f, "certifications", false),
    memberOf: lines(f, "memberOf", false),
    returnPolicy:
      returns === "yes"
        ? { accepted: true, days: num(f, "returnsDays"), freeReturns: f.get("freeReturns") === "on" || undefined }
        : returns === "no"
          ? { accepted: false }
          : undefined,
  };
}

export type ProfileFormResult = { ok: true; profile: BusinessProfile } | { ok: false; error: string };

/** Reads the Business details search-profile form; the first invalid field is reported by name. */
export function profileFromForm(f: Form): ProfileFormResult {
  const parsed = businessProfileSchema.safeParse(rawProfile(f));
  if (parsed.success) return { ok: true, profile: parsed.data };
  const issue = parsed.error.issues[0];
  const field = issue.path.filter((p) => typeof p === "string").join(" › ");
  return { ok: false, error: `${field || "Profile"}: ${issue.message}` };
}
