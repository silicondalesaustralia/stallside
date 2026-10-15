export const SPACER_MIN = 4;
export const SPACER_MAX = 400;
export const SPACER_DEFAULT = 48;

export function spacerHeightOf(value: unknown, fallback = SPACER_DEFAULT): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(SPACER_MAX, Math.max(SPACER_MIN, Math.round(value)));
}

/** Desktop height and phone height (same as desktop unless set). */
export function spacerView(props: Record<string, unknown>): { height: number; mobileHeight: number } {
  const height = spacerHeightOf(props.height);
  return { height, mobileHeight: spacerHeightOf(props.mobileHeight, height) };
}
