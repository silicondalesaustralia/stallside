import assert from "node:assert/strict";
import { parseCsv } from "@/lib/inventory/parse-csv";
import { buildImport } from "./build-rows";
import { autoMapColumns, detectPreset, mappingFromPreset, toRecords } from "./detect";
import type { ImportEntity } from "./fields";

export function runImport(csv: string, entity: ImportEntity) {
  const [headers, ...rows] = parseCsv(csv);
  const preset = detectPreset(headers);
  const mapping = preset ? mappingFromPreset(preset, headers) : autoMapColumns(entity, headers);
  return { preset, built: buildImport(entity, toRecords(rows, mapping), preset) };
}

export function importProducts(lines: string[]) {
  const { preset, built } = runImport(lines.join("\n"), "products");
  assert.equal(built.entity, "products");
  return { preset, items: built.entity === "products" ? built.items : [], issues: built.issues };
}

export function importCustomers(lines: string[]) {
  const { preset, built } = runImport(lines.join("\n"), "customers");
  assert.equal(built.entity, "customers");
  return { preset, items: built.entity === "customers" ? built.items : [] };
}

export function importStock(lines: string[]) {
  const { preset, built } = runImport(lines.join("\n"), "inventory");
  assert.equal(built.entity, "inventory");
  return { preset, items: built.entity === "inventory" ? built.items : [] };
}
