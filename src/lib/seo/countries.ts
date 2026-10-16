/** ISO 3166-1 alpha-2 codes offered in the search profile, with their names. */
export const PROFILE_COUNTRIES = [
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "GB", name: "United Kingdom" },
  { code: "IE", name: "Ireland" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "ZA", name: "South Africa" },
  { code: "SG", name: "Singapore" },
] as const;

const ALIASES: Record<string, string> = {
  UK: "GB",
  "GREAT BRITAIN": "GB",
  ENGLAND: "GB",
  USA: "US",
  "UNITED STATES OF AMERICA": "US",
  AUS: "AU",
  NZL: "NZ",
};

/** Accepts a code or a country name ("Australia", "aus", "UK") and returns the two-letter code. */
export function countryCode(value: string | undefined): string | undefined {
  const v = value?.trim().toUpperCase();
  if (!v) return undefined;
  if (ALIASES[v]) return ALIASES[v];
  const byName = PROFILE_COUNTRIES.find((c) => c.name.toUpperCase() === v);
  return byName ? byName.code : v;
}
