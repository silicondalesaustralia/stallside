import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { SourceEntry } from "./primitives";

export type CouncilCompleteness =
  | "identity_only"
  | "directory_ready"
  | "detail_noindex"
  | "index_candidate";

export type CouncilRegion = "metropolitan" | "regional" | "outback";

export type CouncilRecord = {
  slug: string;
  name: string;
  abs_lga_code: string;
  abs_lga_name: string;
  region: CouncilRegion;
  website: string;
  food_business_page: string;
  notification_form_url: string;
  inspection_fee_page: string;
  temporary_stall_page: string;
  planning_home_business_page: string;
  /** Civic NAP */
  street_address: string;
  suburb: string;
  postcode: string;
  phone: string;
  email: string;
  postal_address: string;
  /** Food Act contact — may differ from civic switchboard */
  eho_phone: string;
  eho_email: string;
  /** When food enforcement is delegated (e.g. Eastern Health Authority) */
  enforcement_agency: string;
  enforcement_agency_url: string;
  notes: string;
  verified_at: string | null;
  sources: SourceEntry[];
  index_score: number;
  completeness: CouncilCompleteness;
};

export type CouncilDirectoryFile = {
  jurisdiction_code: string;
  jurisdiction_slug: string;
  source: {
    geography: string;
    geography_url: string;
    identity_canonical: string;
    note: string;
    seeded_at: string;
  };
  unincorporated: {
    label: string;
    regulator: string;
    form_hint_url: string;
    notes: string;
  };
  councils: CouncilRecord[];
};

const ROOT = join(process.cwd(), "content/jurisdictions");

/** Score local fields for indexability (research map). */
export function scoreCouncilRecord(
  c: Pick<
    CouncilRecord,
    | "food_business_page"
    | "notification_form_url"
    | "inspection_fee_page"
    | "eho_phone"
    | "eho_email"
    | "phone"
    | "planning_home_business_page"
    | "temporary_stall_page"
    | "notes"
  >,
): number {
  let score = 0;
  if (c.food_business_page) score += 2;
  if (c.notification_form_url) score += 2;
  if (c.inspection_fee_page) score += 2;
  if (/inspection/i.test(c.notes) || c.inspection_fee_page) score += 1;
  if (c.eho_phone || c.eho_email || c.phone) score += 1;
  if (c.planning_home_business_page) score += 1;
  if (c.temporary_stall_page) score += 1;
  if (/home kitchen|low-risk|home-based businesses named|home based/i.test(c.notes)) {
    score += 2;
  }
  return score;
}

export function completenessForScore(score: number): CouncilCompleteness {
  if (score >= 6) return "index_candidate";
  if (score >= 3) return "detail_noindex";
  return "directory_ready";
}

export function loadCouncilDirectory(
  code: string,
  country: "AU" | "US" = "AU",
): CouncilDirectoryFile | null {
  const path = join(ROOT, country.toLowerCase(), code, "councils.json");
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as CouncilDirectoryFile;
}

export function primaryCouncilActionUrl(c: CouncilRecord): string | null {
  return (
    c.notification_form_url ||
    c.food_business_page ||
    c.enforcement_agency_url ||
    c.website ||
    null
  );
}

export function formatCouncilAddress(c: CouncilRecord): string | null {
  if (!c.street_address) return null;
  const locality = [c.suburb, c.postcode ? `SA ${c.postcode}` : ""]
    .filter(Boolean)
    .join(" ");
  return locality ? `${c.street_address}, ${locality}` : c.street_address;
}
