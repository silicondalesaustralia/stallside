/**
 * Scrape Missouri LPHAs from DHSS directory into councils.json seed format.
 * Run: npx tsx scripts/seed-mo-lphas.ts
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  completenessForScore,
  scoreCouncilRecord,
  type CouncilDirectoryFile,
  type CouncilRecord,
} from "../src/lib/jurisdictions/council";

const BASE =
  "https://health.mo.gov/local/find-your-local-public-health-agency";

type RawLpha = {
  name: string;
  county: string;
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  phone: string;
  website: string;
};

type Enrichment = Partial<CouncilRecord> & { slug: string };

function slugify(name: string, county: string): string {
  const base = name
    .toLowerCase()
    .replace(/health department|health center|health dept\.?/gi, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const countySlug = county
    .toLowerCase()
    .replace(/\s*\(city\)\s*/g, "-city")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return base || countySlug;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#0?39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePage(html: string): RawLpha[] {
  const results: RawLpha[] = [];
  const blocks = html.split(/<div class="views-row">/).slice(1);

  for (const block of blocks) {
    const nameMatch = block.match(
      /<h3[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/i,
    );
    if (!nameMatch) continue;
    const name = stripHtml(nameMatch[1]);

    const countyMatch = block.match(
      /<div class="county">[\s\S]*?<div class="label">County:<\/div>\s*([^<\n]+)/i,
    );
    const county = countyMatch?.[1]?.trim() ?? "";

    const line1Match = block.match(/class="address-line1">([^<]+)/i);
    const localityMatch = block.match(/class="locality">([^<]+)/i);
    const stateMatch = block.match(/class="administrative-area">([^<]+)/i);
    const postcodeMatch = block.match(/class="postal-code">([^<]+)/i);

    const phoneMatch = block.match(
      /<div class="phone">[\s\S]*?<div class="label">Phone:<\/div>\s*([^<\n]+)/i,
    );
    const phone = phoneMatch?.[1]?.trim().replace(/\s+/g, " ") ?? "";

    const websiteMatch = block.match(
      /<div class="website">[\s\S]*?href="([^"]+)"/i,
    );
    const website = websiteMatch?.[1]?.trim() ?? "";

    results.push({
      name,
      county,
      street: line1Match?.[1]?.trim() ?? "",
      suburb: localityMatch?.[1]?.trim() ?? "",
      state: stateMatch?.[1]?.trim() ?? "MO",
      postcode: postcodeMatch?.[1]?.trim() ?? "",
      phone,
      website,
    });
  }
  return results;
}

async function fetchAll(): Promise<RawLpha[]> {
  const all: RawLpha[] = [];
  const seen = new Set<string>();

  for (let page = 0; page < 15; page++) {
    const url = page === 0 ? BASE : `${BASE}?page=${page}`;
    const res = await fetch(url);
    if (!res.ok) break;
    const html = await res.text();
    const parsed = parsePage(html);
    if (!parsed.length) break;
    for (const row of parsed) {
      const key = `${row.name}|${row.county}`;
      if (seen.has(key)) continue;
      seen.add(key);
      all.push(row);
    }
  }
  return all;
}

function regionFor(county: string): CouncilRecord["region"] {
  const metro =
    /^(Jackson|St\. Louis \(city\)|St\. Louis \(county\)|Clay|Platte|Cass|Greene|Boone|Jefferson|Franklin)/i;
  if (metro.test(county)) return "metropolitan";
  if (/^\w+ \(city\)/.test(county)) return "metropolitan";
  return "regional";
}

function applyEnrichment(c: CouncilRecord, e: Enrichment): CouncilRecord {
  const merged = { ...c, ...e, slug: c.slug, sources: e.sources ?? c.sources };
  const score = scoreCouncilRecord(merged);
  return {
    ...merged,
    index_score: score,
    completeness: completenessForScore(score),
    verified_at: e.verified_at ?? merged.verified_at,
  };
}

function toCouncil(raw: RawLpha): CouncilRecord {
  const slug = slugify(raw.name, raw.county);
  const streetAddress = [raw.street, raw.suburb, raw.state, raw.postcode]
    .filter(Boolean)
    .join(", ")
    .replace(/,\s*MO,\s*/, ", MO ");
  const notes =
    "Local public health agency for food establishment rules outside RSMo 196.298 cottage food. Cottage food production under 196.298 is not regulated by LPHAs; farmers markets and home-based food outside cottage food may require LPHA contact.";
  const c: CouncilRecord = {
    slug,
    name: raw.name,
    abs_lga_code: "",
    abs_lga_name: raw.county,
    region: regionFor(raw.county),
    website: raw.website || BASE,
    food_business_page: "",
    notification_form_url: "",
    inspection_fee_page: "",
    temporary_stall_page: "",
    planning_home_business_page: "",
    street_address: streetAddress,
    suburb: raw.suburb,
    postcode: raw.postcode,
    phone: raw.phone,
    email: "",
    postal_address: streetAddress,
    eho_phone: raw.phone,
    eho_email: "",
    enforcement_agency: "",
    enforcement_agency_url: "",
    notes,
    verified_at: "2026-08-28",
    sources: [
      {
        field: "phone",
        url: BASE,
        retrieved: "2026-08-28",
        tier: 2,
      },
    ],
    index_score: 0,
    completeness: "identity_only",
  };
  const score = scoreCouncilRecord(c);
  return {
    ...c,
    index_score: score,
    completeness: completenessForScore(score),
  };
}

async function main() {
  const enrichPath = join(
    process.cwd(),
    "scripts/council-seeds/mo-enrichments.json",
  );
  const enrichments: Enrichment[] = existsSync(enrichPath)
    ? (JSON.parse(readFileSync(enrichPath, "utf8")) as Enrichment[])
    : [];
  const enrichBySlug = new Map(enrichments.map((e) => [e.slug, e]));

  const raw = await fetchAll();
  console.log(`Fetched ${raw.length} LPHAs`);
  const councils = raw
    .map(toCouncil)
    .map((c) => {
      const e = enrichBySlug.get(c.slug);
      return e ? applyEnrichment(c, e) : c;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const file: CouncilDirectoryFile = {
    jurisdiction_code: "mo",
    jurisdiction_slug: "missouri",
    source: {
      geography: "Missouri DHSS Local Public Health Agency directory",
      geography_url: BASE,
      identity_canonical: BASE,
      note: "118 local public health agencies (LPHAs). Reuses council directory schema. LPHAs regulate retail food establishments under the Missouri Food Code; they do not regulate cottage food production under RSMo 196.298.",
      seeded_at: "2026-08-28",
    },
    unincorporated: {
      label: "DHSS statewide food safety",
      regulator: "Missouri Department of Health and Senior Services",
      form_hint_url: "https://health.mo.gov/safety/foodsafety/",
      notes:
        "Cottage food production operations under RSMo 196.298 are not regulated by local health departments. DHSS maintains complaint records and outbreak investigation authority.",
    },
    councils,
  };

  const out = join(
    process.cwd(),
    "content/jurisdictions/us/mo/councils.json",
  );
  writeFileSync(out, `${JSON.stringify(file, null, 2)}\n`);
  const enriched = councils.filter(
    (c) => c.completeness === "index_candidate",
  ).length;
  console.log(
    `Wrote ${councils.length} agencies (${enriched} index_candidate) → ${out}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
