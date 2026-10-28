import { parseCsv } from "@/lib/inventory/parse-csv";
import { autoMapColumns, detectPreset, mappingFromPreset } from "./detect";
import type { ImportEntity } from "./fields";
import { loadSavedMapping } from "./saved-mappings";
import type { ColumnMapping, ImportPreset } from "./types";

export const MAX_IMPORT_FILE_BYTES = 15 * 1024 * 1024;
export const MAX_IMPORT_FILE_ROWS = 20_000;

export type LoadedFile = {
  fileName: string;
  headers: string[];
  rows: string[][];
  entity: ImportEntity;
  preset: ImportPreset | null;
  mapping: ColumnMapping;
};

/** Reads a CSV, recognises the platform export when it can, and pre-fills the column mapping. */
export async function loadImportFile(
  file: File,
  entity: ImportEntity,
): Promise<LoadedFile | { error: string }> {
  if (!/\.csv$/i.test(file.name) && file.type !== "text/csv") {
    return { error: "Choose a CSV file. In Excel or Numbers, use File → Export → CSV." };
  }
  if (file.size > MAX_IMPORT_FILE_BYTES) return { error: "File is too large (15 MB max)." };
  const [headers, ...rows] = parseCsv(await file.text());
  if (!headers?.length) return { error: "The file is empty." };
  if (rows.length > MAX_IMPORT_FILE_ROWS) {
    return { error: `Too many rows (${MAX_IMPORT_FILE_ROWS.toLocaleString()} max). Split the file.` };
  }
  const detected = detectPreset(headers);
  const preset = detected && detected.entity === entity ? detected : null;
  if (detected && !preset) {
    return {
      error: `This looks like a ${detected.platform} ${detected.entity} export. Choose “${detected.entity}” above and try again.`,
    };
  }
  const mapping =
    (preset ? mappingFromPreset(preset, headers) : null) ??
    loadSavedMapping(entity, headers) ??
    autoMapColumns(entity, headers);
  return { fileName: file.name, headers, rows, entity, preset, mapping };
}
