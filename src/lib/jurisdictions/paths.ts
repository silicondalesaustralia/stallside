import type { JurisdictionRecord } from "./types";

export const AU_HUB_PATH = "/sell-food-from-home";
export const US_HUB_PATH = "/cottage-food-laws";

export function hubPathFor(record: JurisdictionRecord): string {
  return record.country === "US" ? US_HUB_PATH : AU_HUB_PATH;
}

export function jurisdictionPath(slug: string, country?: "AU" | "US"): string {
  if (country === "US") return `${US_HUB_PATH}/${slug}`;
  if (country === "AU") return `${AU_HUB_PATH}/${slug}`;
  // Prefer AU hub for bare slug calls from AU-only pages.
  return `${AU_HUB_PATH}/${slug}`;
}

export function jurisdictionPathFor(record: JurisdictionRecord): string {
  return `${hubPathFor(record)}/${record.slug}`;
}

export function councilsPath(slug: string): string {
  return `${AU_HUB_PATH}/${slug}/councils`;
}

/** US local health agency directory (reuses council data schema). */
export function localAgenciesPath(slug: string): string {
  return `${US_HUB_PATH}/${slug}/local-agencies`;
}

export function localDirectoryPath(record: JurisdictionRecord): string {
  return record.country === "US"
    ? localAgenciesPath(record.slug)
    : councilsPath(record.slug);
}

/** Geographic neighbours for AU body links (phase 1). */
export const AU_NEIGHBOURS: Record<string, string[]> = {
  "new-south-wales": [
    "victoria",
    "queensland",
    "australian-capital-territory",
    "south-australia",
  ],
  victoria: ["new-south-wales", "south-australia", "tasmania"],
  queensland: ["new-south-wales", "northern-territory"],
  "south-australia": [
    "australian-capital-territory",
  ],
  "western-australia": ["south-australia", "northern-territory"],
  tasmania: ["victoria"],
  "australian-capital-territory": ["south-australia"],
  "northern-territory": [
    "south-australia",
    "western-australia",
    "queensland",
  ],
};

/** US pilot neighbours for phase 1 body links (volume set). */
export const US_NEIGHBOURS: Record<string, string[]> = {
  florida: ["south-carolina", "ohio"],
  michigan: ["ohio", "missouri"],
  ohio: ["michigan", "missouri", "south-carolina"],
  "south-carolina": ["florida", "missouri"],
  missouri: [],
  california: ["missouri", "florida"],
};

export function neighboursFor(record: JurisdictionRecord): string[] {
  if (record.country === "US") return US_NEIGHBOURS[record.slug] ?? [];
  return AU_NEIGHBOURS[record.slug] ?? [];
}

export function isPageIndexable(record: JurisdictionRecord): boolean {
  return record.meta.completeness === "verified_publishable";
}

export function isPageRenderable(record: JurisdictionRecord): boolean {
  return (
    record.meta.completeness === "research_complete" ||
    record.meta.completeness === "verified_publishable"
  );
}

export function formatFee(record: JurisdictionRecord): string {
  const { fee, fee_currency, fee_notes } = record.gate;
  if (fee === 0) {
    return fee_currency === "AUD" ? "A$0 (nil)" : "Nil";
  }
  if (fee === "not_published") {
    return fee_notes || "Not published by the regulator";
  }
  if (typeof fee === "number") {
    const code =
      fee_currency === "AUD" ? "A$" : fee_currency === "USD" ? "US$" : "";
    return `${code}${fee.toLocaleString(record.country === "US" ? "en-US" : "en-AU")}`;
  }
  return "Confirm with the regulator";
}

export function formatMoneyAud(amount: number): string {
  return `A$${amount.toLocaleString("en-AU")}`;
}
