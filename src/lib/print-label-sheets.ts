/** Avery-compatible A4 sticky-sheet layouts for collection packing labels. */

export type LabelSheetId = "l7163" | "l7160" | "l7162" | "a4-cards";

export type LabelSheetTemplate = {
  id: LabelSheetId;
  name: string;
  blurb: string;
  /** Labels per sheet */
  perSheet: number;
  cols: number;
  rows: number;
  pageWidthMm: 210;
  pageHeightMm: 297;
  marginTopMm: number;
  marginLeftMm: number;
  labelWidthMm: number;
  labelHeightMm: number;
  gapXMm: number;
  gapYMm: number;
  /** Safe inset inside each label (content must not hug die-cut edges). */
  padMm: number;
};

/**
 * Geometry matches common Avery / Officeworks clones.
 * Inner padMm is intentional content margin; sheet margins stay sheet-accurate.
 */
export const LABEL_SHEETS: Record<LabelSheetId, LabelSheetTemplate> = {
  l7163: {
    id: "l7163",
    name: "Avery L7163 · 14-up",
    blurb: "99.1 × 38.1 mm - best for name, items, and order #",
    perSheet: 14,
    cols: 2,
    rows: 7,
    pageWidthMm: 210,
    pageHeightMm: 297,
    marginTopMm: 15.17,
    marginLeftMm: 3.35,
    labelWidthMm: 99.1,
    labelHeightMm: 38.1,
    gapXMm: 3.9,
    gapYMm: 0,
    padMm: 2.8,
  },
  l7160: {
    id: "l7160",
    name: "Avery L7160 · 21-up",
    blurb: "63.5 × 38.1 mm - compact name tags",
    perSheet: 21,
    cols: 3,
    rows: 7,
    pageWidthMm: 210,
    pageHeightMm: 297,
    marginTopMm: 15.1,
    marginLeftMm: 4.7,
    labelWidthMm: 63.5,
    labelHeightMm: 38.1,
    gapXMm: 2.5,
    gapYMm: 0,
    padMm: 2.4,
  },
  l7162: {
    id: "l7162",
    name: "Avery L7162 · 16-up",
    blurb: "99.1 × 33.9 mm - slim packing labels",
    perSheet: 16,
    cols: 2,
    rows: 8,
    pageWidthMm: 210,
    pageHeightMm: 297,
    marginTopMm: 12.9,
    marginLeftMm: 3.35,
    labelWidthMm: 99.1,
    labelHeightMm: 33.9,
    gapXMm: 3.9,
    gapYMm: 0,
    padMm: 2.5,
  },
  "a4-cards": {
    id: "a4-cards",
    name: "A4 cards · 8-up",
    blurb: "Cut-apart cards on plain A4 (no sticker sheet needed)",
    perSheet: 8,
    cols: 2,
    rows: 4,
    pageWidthMm: 210,
    pageHeightMm: 297,
    marginTopMm: 10,
    marginLeftMm: 10,
    labelWidthMm: 90,
    labelHeightMm: 64,
    gapXMm: 10,
    gapYMm: 8,
    padMm: 5,
  },
};

export const DEFAULT_LABEL_SHEET: LabelSheetId = "l7163";

export function chunkForSheet<T>(items: T[], perSheet: number): T[][] {
  if (perSheet < 1) return [items];
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += perSheet) {
    pages.push(items.slice(i, i + perSheet));
  }
  return pages.length ? pages : [[]];
}
