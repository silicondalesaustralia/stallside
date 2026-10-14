const KEY = "websiteStandId";

/**
 * The stand whose products, cart and checkout power the website. Stored in the
 * draft config (always the owner's current choice, effective immediately);
 * unset means the owner's first stand.
 */
export function websiteStandIdFromConfig(raw: unknown): string | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const value = (raw as Record<string, unknown>)[KEY];
  return typeof value === "string" && value.trim() ? value : null;
}

export function withWebsiteStandId(raw: unknown, standId: string): Record<string, unknown> {
  const base = raw && typeof raw === "object" && !Array.isArray(raw) ? { ...(raw as Record<string, unknown>) } : {};
  base[KEY] = standId;
  return base;
}

/** The chosen stand when it still exists, else the first (oldest) one. */
export function pickWebsiteStand<T extends { id: string }>(stands: T[], draftConfig: unknown): T | undefined {
  const chosen = websiteStandIdFromConfig(draftConfig);
  return (chosen ? stands.find((s) => s.id === chosen) : undefined) ?? stands[0];
}
