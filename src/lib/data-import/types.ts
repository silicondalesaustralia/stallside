import type { ImportEntity } from "./fields";

/** Canonical field key → raw cell text. */
export type ImportRecord = Record<string, string>;

/**
 * product = standalone row; parent = holds shared details only; variant = one sellable option row;
 * media = extra image for the group (used when the product row has none).
 */
export type RowKind = "product" | "parent" | "variant" | "media" | "skip";

export type PreparedRow = {
  rec: ImportRecord;
  kind: RowKind;
  /** Rows sharing a group become one product. */
  group: string;
  /** Other keys that variant rows may use to point at this group (e.g. a parent SKU). */
  aliases?: string[];
};

/** Column → canonical field. Strings are exact lowercase headers; RegExps match the first header. */
export type ColumnSpec = string | RegExp;

export type ImportPreset = {
  id: string;
  platform: string;
  entity: ImportEntity;
  /** Headers that must all be present to recognise the file. */
  fingerprint: ColumnSpec[];
  columns: Record<string, ColumnSpec>;
  /** Keys copied down from the previous row onto rows with no product name (continuation rows). */
  fillDown?: string[];
  /** Repeated rows for the same item (one per location) add up instead of the first winning. */
  sumRepeatedStock?: boolean;
  /** Platform quirks: decide row kind and group, fix values. */
  prepare?: (rec: ImportRecord) => PreparedRow;
  /** Where to find the export in the platform's admin. */
  howToExport: string;
};

/** Canonical field key → index of the source column, or -1 when unmapped. */
export type ColumnMapping = Record<string, number>;
