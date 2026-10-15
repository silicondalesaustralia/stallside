/**
 * Seller overrides for a section's fixed wording (labels, badges, small print), stored as
 * `props.texts[key]`. A missing or blank key shows the default copy. `{name}` placeholders
 * are filled from data at render time (e.g. `{count} products listed this week`).
 */
export const SECTION_TEXT_MAX = 300;
export const SECTION_TEXT_MAX_KEYS = 40;
export const SECTION_TEXT_KEY = /^[a-zA-Z0-9_]{1,40}$/;

export type SectionTexts = Record<string, string>;

/** Saved overrides, or none when any entry breaks the rules in `sectionTextsSchema`. */
export function parseSectionTexts(raw: unknown): SectionTexts {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const entries = Object.entries(raw);
  if (entries.length > SECTION_TEXT_MAX_KEYS) return {};
  const valid = entries.every(
    ([key, value]) => SECTION_TEXT_KEY.test(key) && typeof value === "string" && value.length <= SECTION_TEXT_MAX,
  );
  return valid ? (Object.fromEntries(entries) as SectionTexts) : {};
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
