import { z } from "zod";

/**
 * Seller overrides for a section's fixed wording (labels, badges, small print), stored as
 * `props.texts[key]`. A missing or blank key shows the default copy. `{name}` placeholders
 * are filled from data at render time (e.g. `{count} products listed this week`).
 */
export const SECTION_TEXT_MAX = 300;
const MAX_KEYS = 40;
const KEY = /^[a-zA-Z0-9_]{1,40}$/;

export const sectionTextsSchema = z
  .record(z.string().regex(KEY), z.string().max(SECTION_TEXT_MAX))
  .refine((v) => Object.keys(v).length <= MAX_KEYS, "Too many text overrides.");

export type SectionTexts = Record<string, string>;

export function parseSectionTexts(raw: unknown): SectionTexts {
  const parsed = sectionTextsSchema.safeParse(raw);
  return parsed.success ? parsed.data : {};
}

export function sectionText(texts: SectionTexts | undefined, key: string, fallback: string): string {
  const custom = texts?.[key];
  return custom && custom.trim() ? custom : fallback;
}

export function fillTextVars(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));
}

/** The next `texts` map after an edit: back to the default (key removed) when blank or unchanged. */
export function withSectionText(texts: unknown, key: string, next: string, fallback: string): SectionTexts {
  const current = { ...parseSectionTexts(texts) };
  const value = next.slice(0, SECTION_TEXT_MAX);
  if (!value.trim() || value === fallback) delete current[key];
  else current[key] = value;
  return current;
}
