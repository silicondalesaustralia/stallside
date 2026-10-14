/** The button colour the shopper sees on this page (website button colour, else brand accent), as #RRGGBB. */
export function shopButtonColour(el: HTMLElement | null): string | undefined {
  if (!el) return undefined;
  const css = getComputedStyle(el);
  const value = (css.getPropertyValue("--site-btn-bg").trim() || css.getPropertyValue("--leaf").trim());
  return /^#[0-9a-f]{6}$/i.test(value) ? value : undefined;
}
