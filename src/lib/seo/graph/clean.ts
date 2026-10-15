export type JsonLdNode = Record<string, unknown>;

/** Drops undefined, null, blank strings, empty arrays and empty objects, recursively. */
export function clean<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(clean).filter((v) => !isEmpty(v)) as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const c = clean(v);
      if (!isEmpty(c)) out[k] = c;
    }
    return out as T;
  }
  return value;
}

function isEmpty(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") return Object.keys(v as object).length === 0;
  return false;
}

/** Stable node ids so every page's graph points at the same business and website. */
export function graphIds(homeUrl: string, pageUrl: string) {
  const home = homeUrl.replace(/\/$/, "");
  return {
    business: `${home}/#organization`,
    website: `${home}/#website`,
    logo: `${home}/#logo`,
    founder: `${home}/#founder`,
    webpage: `${pageUrl}#webpage`,
    breadcrumb: `${pageUrl}#breadcrumb`,
    primaryImage: `${pageUrl}#primaryimage`,
  };
}

const LANG: Record<string, string> = { AUD: "en-AU", NZD: "en-NZ", USD: "en-US", GBP: "en-GB", CAD: "en-CA", EUR: "en-IE" };
const COUNTRY: Record<string, string> = { AUD: "AU", NZD: "NZ", USD: "US", GBP: "GB", CAD: "CA", EUR: "IE" };

export function languageFor(currency: string): string {
  return LANG[currency] ?? "en";
}

export function countryFor(currency: string): string {
  return COUNTRY[currency] ?? "AU";
}

export function money(cents: number): string {
  return (cents / 100).toFixed(2);
}
