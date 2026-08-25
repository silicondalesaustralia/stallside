import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  loadCouncilDirectory,
  type CouncilDirectoryFile,
} from "./council";
import type { CountryCode } from "./primitives";
import type { JurisdictionRecord } from "./types";

const ROOT = join(process.cwd(), "content/jurisdictions");
const AU_DIR = join(ROOT, "au");
const US_DIR = join(ROOT, "us");

function listCodes(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

export function listAuJurisdictionCodes(): string[] {
  return listCodes(AU_DIR);
}

export function listUsJurisdictionCodes(): string[] {
  return listCodes(US_DIR);
}

export function loadJurisdictionRecord(
  code: string,
  country: CountryCode = "AU",
): JurisdictionRecord {
  const dir = country === "US" ? US_DIR : AU_DIR;
  const path = join(dir, code, "record.json");
  const raw = readFileSync(path, "utf8");
  return JSON.parse(raw) as JurisdictionRecord;
}

export function loadAllAuJurisdictionRecords(): JurisdictionRecord[] {
  return listAuJurisdictionCodes().map((code) =>
    loadJurisdictionRecord(code, "AU"),
  );
}

export function loadAllUsJurisdictionRecords(): JurisdictionRecord[] {
  return listUsJurisdictionCodes().map((code) =>
    loadJurisdictionRecord(code, "US"),
  );
}

export function loadAllJurisdictionRecords(): JurisdictionRecord[] {
  return [
    ...loadAllAuJurisdictionRecords(),
    ...loadAllUsJurisdictionRecords(),
  ];
}

export function getJurisdictionBySlug(slug: string): JurisdictionRecord | null {
  const match = loadAllJurisdictionRecords().find((r) => r.slug === slug);
  return match ?? null;
}

/** Curated page body. Absent → compose from sections. */
export function loadJurisdictionPageMarkdown(
  code: string,
  country: CountryCode = "AU",
): string | null {
  const dir = country === "US" ? US_DIR : AU_DIR;
  const path = join(dir, code, "page.md");
  if (!existsSync(path)) return null;
  return readFileSync(path, "utf8");
}

/** Local-authority directory for a jurisdiction, when seeded. */
export function loadJurisdictionCouncils(
  code: string,
  country: CountryCode = "AU",
): CouncilDirectoryFile | null {
  return loadCouncilDirectory(code, country);
}
