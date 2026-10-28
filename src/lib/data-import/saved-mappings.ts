import type { ImportEntity } from "./fields";
import { normaliseHeader } from "./detect";
import type { ColumnMapping } from "./types";

const PREFIX = "vendl-import-mapping:";

function keyFor(entity: ImportEntity, headers: string[]): string {
  return `${PREFIX}${entity}:${headers.map(normaliseHeader).join("|")}`;
}

/** Mapping the seller saved last time for a file with exactly these headers. */
export function loadSavedMapping(entity: ImportEntity, headers: string[]): ColumnMapping | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(keyFor(entity, headers));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const mapping: ColumnMapping = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === "number" && v >= -1 && v < headers.length) mapping[k] = v;
    }
    return mapping;
  } catch (error) {
    console.error("Could not read saved import mapping", error);
    return null;
  }
}

export function saveMapping(entity: ImportEntity, headers: string[], mapping: ColumnMapping) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(keyFor(entity, headers), JSON.stringify(mapping));
  } catch (error) {
    console.error("Could not save import mapping", error);
  }
}
