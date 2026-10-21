import { parseCsv, type CsvRow } from "./parse-csv";
import { DATA_SECTIONS, isSectionId, SECTION_IDS, sectionForFileName, type SectionId } from "./registry";
import { readZip } from "./zip";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_ROWS = 5000;

export type UploadSection = { section: SectionId; fileName: string; rows: CsvRow[] };
export type ReadUpload = { sections: UploadSection[]; skipped: string[] } | { error: string };

function isZip(bytes: Buffer): boolean {
  return bytes.length > 4 && bytes.readUInt32LE(0) === 0x04034b50;
}

function toSection(section: SectionId, fileName: string, text: string): UploadSection | string {
  const { rows } = parseCsv(text);
  if (rows.length > MAX_ROWS) return `${fileName} has more than ${MAX_ROWS} rows; split it into smaller files`;
  return { section, fileName, rows };
}

/** Accepts one section's CSV, or a ZIP from "Download everything" (files matched by name). */
export async function readUpload(file: File | null, sectionHint: string): Promise<ReadUpload> {
  if (!file || file.size === 0) return { error: "Choose a CSV or ZIP file first." };
  if (file.size > MAX_UPLOAD_BYTES) return { error: "That file is over 5 MB. Split it into smaller files." };
  const bytes = Buffer.from(await file.arrayBuffer());
  const skipped: string[] = [];
  const sections: UploadSection[] = [];

  if (isZip(bytes)) {
    let entries;
    try {
      entries = readZip(bytes);
    } catch (error) {
      console.error("Import ZIP could not be read", error);
      return { error: "That ZIP file could not be read." };
    }
    for (const entry of entries) {
      const id = sectionForFileName(entry.name);
      if (!id || !DATA_SECTIONS[id].apply) {
        skipped.push(entry.name);
        continue;
      }
      const result = toSection(id, entry.name, entry.data.toString("utf8"));
      if (typeof result === "string") return { error: result };
      sections.push(result);
    }
  } else {
    if (!isSectionId(sectionHint) || !DATA_SECTIONS[sectionHint].apply) {
      return { error: "Upload a ZIP to import everything, or a CSV from one section." };
    }
    const result = toSection(sectionHint, file.name, bytes.toString("utf8"));
    if (typeof result === "string") return { error: result };
    sections.push(result);
  }

  if (!sections.length) return { error: "No importable files found. Use the file names from the export." };
  sections.sort((a, b) => SECTION_IDS.indexOf(a.section) - SECTION_IDS.indexOf(b.section));
  return { sections, skipped };
}
