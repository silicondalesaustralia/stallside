import { FIELDS_BY_ENTITY, type ImportEntity } from "./fields";
import { IMPORT_PRESETS } from "./presets";
import type { ColumnMapping, ColumnSpec, ImportPreset, ImportRecord } from "./types";

export function normaliseHeader(header: string): string {
  return header.replace(/^\uFEFF/, "").trim().toLowerCase().replace(/\s+/g, " ");
}

function findColumn(headers: string[], spec: ColumnSpec): number {
  return typeof spec === "string"
    ? headers.indexOf(spec)
    : headers.findIndex((h) => spec.test(h));
}

/** The platform preset whose fingerprint headers are all present, if any. */
export function detectPreset(rawHeaders: string[]): ImportPreset | null {
  const headers = rawHeaders.map(normaliseHeader);
  return (
    IMPORT_PRESETS.find((p) => p.fingerprint.every((f) => findColumn(headers, f) >= 0)) ?? null
  );
}

export function mappingFromPreset(preset: ImportPreset, rawHeaders: string[]): ColumnMapping {
  const headers = rawHeaders.map(normaliseHeader);
  const mapping: ColumnMapping = {};
  for (const [key, spec] of Object.entries(preset.columns)) {
    mapping[key] = findColumn(headers, spec);
  }
  return mapping;
}

/** Best-guess mapping for an unknown file using each field's aliases. */
export function autoMapColumns(entity: ImportEntity, rawHeaders: string[]): ColumnMapping {
  const headers = rawHeaders.map(normaliseHeader);
  const used = new Set<number>();
  const mapping: ColumnMapping = {};
  for (const field of FIELDS_BY_ENTITY[entity]) {
    const idx = headers.findIndex((h, i) => !used.has(i) && field.aliases.includes(h));
    mapping[field.key] = idx;
    if (idx >= 0) used.add(idx);
  }
  return mapping;
}

/** Applies a mapping to data rows. */
export function toRecords(rows: string[][], mapping: ColumnMapping): ImportRecord[] {
  return rows.map((row) => {
    const rec: ImportRecord = {};
    for (const [key, idx] of Object.entries(mapping)) {
      rec[key] = idx >= 0 ? (row[idx] ?? "").trim().replace(/^'(?=[=+\-@])/, "") : "";
    }
    return rec;
  });
}

/** Required fields that have no column yet. */
export function missingRequired(entity: ImportEntity, mapping: ColumnMapping): string[] {
  return FIELDS_BY_ENTITY[entity]
    .filter((f) => f.required && (mapping[f.key] ?? -1) < 0)
    .map((f) => f.label);
}
