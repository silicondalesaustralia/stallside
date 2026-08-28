/**
 * Generate content/jurisdictions/au/{code}/councils.json from ABS seed files
 * and optional metro enrichments in scripts/council-seeds/{code}-enrichments.json
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  completenessForScore,
  scoreCouncilRecord,
  type CouncilDirectoryFile,
  type CouncilRecord,
  type CouncilRegion,
} from "../src/lib/jurisdictions/council";

const ROOT = join(process.cwd());
const SEED_DIR = join(ROOT, "scripts/council-seeds");
const OUT_DIR = join(ROOT, "content/jurisdictions/au");

const SKIP_NAME = /unincorporated|no usual address|migratory|offshore|shipping|darwin waterfront/i;

type AbsFeature = {
  attributes: { LGA_CODE_2025: string; LGA_NAME_2025: string };
};

type Enrichment = Partial<CouncilRecord> & { slug: string };

type StateConfig = {
  code: string;
  slug: string;
  identityCanonical: string;
  note: string;
  unincorporated: CouncilDirectoryFile["unincorporated"];
  metroSlugs: Set<string>;
  outbackSlugs: Set<string>;
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\([^)]*\)\s*/g, "")
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function councilDisplayName(absName: string): string {
  const base = absName.replace(/\s*\([^)]*\)\s*/g, "").trim();
  if (/^city of /i.test(base) || / council$/i.test(base) || / shire$/i.test(base)) {
    return base;
  }
  if (/shire$/i.test(base) || base.includes("Regional")) return `${base} Council`;
  if (base === "Merri-bek") return "Merri-bek City Council";
  return `${base}${base.startsWith("City") ? "" : base.includes("City") ? "" : ""}`.replace(
    /^(.*)$/,
    (_, n: string) => {
      if (/^(East|West|North|South|Greater|Port|Mount|Central|Southern|Northern)/.test(n)) {
        if (n.includes("City")) return n;
        return `${n} Council`;
      }
      if (n.endsWith("City")) return n;
      return `${n}${n.includes("Council") ? "" : " Council"}`;
    },
  );
}

function emptyCouncil(
  absName: string,
  absCode: string,
  region: CouncilRegion,
): CouncilRecord {
  const slug = slugify(absName);
  return {
    slug,
    name: councilDisplayName(absName),
    abs_lga_code: absCode,
    abs_lga_name: absName.replace(/\s*\([^)]*\)\s*/g, "").trim(),
    region,
    website: "",
    food_business_page: "",
    notification_form_url: "",
    inspection_fee_page: "",
    temporary_stall_page: "",
    planning_home_business_page: "",
    street_address: "",
    suburb: "",
    postcode: "",
    phone: "",
    email: "",
    postal_address: "",
    eho_phone: "",
    eho_email: "",
    enforcement_agency: "",
    enforcement_agency_url: "",
    notes: "",
    verified_at: null,
    sources: [],
    index_score: 0,
    completeness: "identity_only",
  };
}

function applyEnrichment(c: CouncilRecord, e: Enrichment): CouncilRecord {
  const merged = { ...c, ...e, slug: c.slug, sources: e.sources ?? c.sources };
  const score = scoreCouncilRecord(merged);
  return {
    ...merged,
    index_score: score,
    completeness: score >= 6 ? "index_candidate" : completenessForScore(score),
    verified_at: e.verified_at ?? merged.verified_at,
  };
}

const STATES: StateConfig[] = [
  {
    code: "vic",
    slug: "victoria",
    identityCanonical: "https://www.vic.gov.au/know-your-council",
    note: "Seeded from ABS LGA 2025 for Victoria, excluding unincorporated and statistical special-purpose codes (79 LGAs). Victoria uses Food Act 1984 class 1–4 registration or notification via FoodTrader.",
    unincorporated: {
      label: "PrimeSafe / Dairy Food Safety Victoria",
      regulator: "PrimeSafe or Dairy Food Safety Victoria",
      form_hint_url: "https://www.health.vic.gov.au/food-safety",
      notes:
        "Meat and seafood processing sits with PrimeSafe; dairy with Dairy Food Safety Victoria. Fixed premises register with the council where the premises sits.",
    },
    metroSlugs: new Set([
      "melbourne", "merri-bek", "port-phillip", "stonnington", "boroondara", "glen-eira",
      "monash", "bayside", "kingston", "whitehorse", "manningham", "maribyrnong",
      "hobsons-bay", "maroondah", "knox", "yarra", "darebin", "banyule", "hume",
      "whittlesea", "nillumbik", "moonee-valley", "brimbank", "melton", "wyndham",
      "hobsons-bay", "frankston", "greater-dandenong", "casey", "cardinia",
      "mornington-peninsula", "macedon-ranges", "yarra-ranges",
    ]),
    outbackSlugs: new Set([]),
  },
  {
    code: "wa",
    slug: "western-australia",
    identityCanonical: "https://walga.asn.au/",
    note: "Seeded from ABS LGA 2025 for Western Australia, excluding statistical special-purpose codes (137 LGAs). Home-prepared food for sale generally requires registration with local government Environmental Health.",
    unincorporated: {
      label: "WA Department of Health regulated sites",
      regulator: "WA Department of Health",
      form_hint_url: "https://www.health.wa.gov.au/Articles/F_I/Home-based-food-businesses",
      notes:
        "Most food businesses register with local government. Department of Health prescribed fees apply to DoH-regulated sites only.",
    },
    metroSlugs: new Set([
      "perth", "stirling", "joondalup", "wanneroo", "swan", "belmont", "victoria-park",
      "fremantle", "east-fremantle", "cockburn", "melville", "canning", "gosnells",
      "armadale", "mandurah", "subiaco", "south-perth", "vincent", "cambridge",
      "nedlands", "claremont", "cottesloe", "mosman-park", "bassendean", "bayswater",
      "kalamunda", "mundaring", "serpentine-jarrahdale", "rockingham", "kwinana",
    ]),
    outbackSlugs: new Set([
      "broome", "derby-west-kimberley", "east-pilbara", "halls-creek", "ngaanyatjarraku",
      "west-arthur",
    ]),
  },
  {
    code: "tas",
    slug: "tasmania",
    identityCanonical: "https://www.lgat.tas.gov.au/tasmanian-councils",
    note: "Seeded from ABS LGA 2025 for Tasmania, excluding statistical special-purpose codes (29 LGAs). Priority risk class P1–P3 register annually; P3-N and P4 notify once.",
    unincorporated: {
      label: "Tasmanian Department of Health",
      regulator: "Tasmanian Department of Health",
      form_hint_url: "https://www.health.tas.gov.au/publications/tasmania-food-business-risk-classification-system-fact-sheet",
      notes: "Council EHO assigns Priority class. Contact the local council Environmental Health Officer before operating.",
    },
    metroSlugs: new Set([
      "hobart", "glenorchy", "clarence", "kingborough", "brighton", "sorell",
      "launceston", "devonport", "burnie", "west-tamar", "george-town",
    ]),
    outbackSlugs: new Set(["west-coast", "king-island", "flinders"]),
  },
  {
    code: "nt",
    slug: "northern-territory",
    identityCanonical: "https://www.lgant.asn.au/about/membership/",
    note: "Seeded from ABS LGA 2025 for the Northern Territory, excluding unincorporated, Darwin Waterfront Precinct and statistical special-purpose codes (17 LGAs). Food business registration is centralised via NT Health Territory Services.",
    unincorporated: {
      label: "NT Health food business registration",
      regulator: "NT Health Environmental Health",
      form_hint_url:
        "https://nt.gov.au/industry/hospitality/accommodation-and-food-businesses/register-food-business",
      notes:
        "Register food businesses with NT Health through Territory Services before operating. Local councils handle planning, home business and market stall permits.",
    },
    metroSlugs: new Set(["darwin", "palmerston", "litchfield", "wagait", "belyuen", "coomalie"]),
    outbackSlugs: new Set([
      "barkly", "central-desert", "east-arnhem", "groote-archipelago", "macdonnell",
      "roper-gulf", "tiwi-islands", "victoria-daly", "west-arnhem", "west-daly",
    ]),
  },
];

function regionFor(slug: string, cfg: StateConfig): CouncilRegion {
  if (cfg.metroSlugs.has(slug)) return "metropolitan";
  if (cfg.outbackSlugs.has(slug)) return "outback";
  return "regional";
}

function generate(cfg: StateConfig) {
  const absPath = join(SEED_DIR, `${cfg.code}-abs.json`);
  const enrichPath = join(SEED_DIR, `${cfg.code}-enrichments.json`);
  const abs = JSON.parse(readFileSync(absPath, "utf8")) as { features: AbsFeature[] };
  const enrichments: Enrichment[] = existsSync(enrichPath)
    ? (JSON.parse(readFileSync(enrichPath, "utf8")) as Enrichment[])
    : [];
  const enrichBySlug = new Map(enrichments.map((e) => [e.slug, e]));

  const councils = abs.features
    .filter((f) => !SKIP_NAME.test(f.attributes.LGA_NAME_2025))
    .map((f) => {
      const absName = f.attributes.LGA_NAME_2025;
      const absCode = f.attributes.LGA_CODE_2025;
      const slug = slugify(absName);
      let c = emptyCouncil(absName, absCode, regionFor(slug, cfg));
      const e = enrichBySlug.get(slug);
      if (e) c = applyEnrichment(c, e);
      return c;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const file: CouncilDirectoryFile = {
    jurisdiction_code: cfg.code,
    jurisdiction_slug: cfg.slug,
    source: {
      geography: "ABS ASGS Edition 3 Local Government Areas 2025",
      geography_url:
        "https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs/edition-3-july-2021-june-2026/non-abs-structures/local-government-areas",
      identity_canonical: cfg.identityCanonical,
      note: cfg.note,
      seeded_at: "2026-08-28",
    },
    unincorporated: cfg.unincorporated,
    councils,
  };

  const outPath = join(OUT_DIR, cfg.code, "councils.json");
  writeFileSync(outPath, `${JSON.stringify(file, null, 2)}\n`);
  const enriched = councils.filter((c) => c.completeness === "index_candidate").length;
  console.log(`${cfg.code}: ${councils.length} councils, ${enriched} index_candidate → ${outPath}`);
}

for (const cfg of STATES) generate(cfg);
