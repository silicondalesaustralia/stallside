import { BRAND_FONT_PAIRS } from "@/lib/website/brand-fonts";

/** One Google font a seller can use for headings or body text, taken from the curated font pairs. */
export type SiteFont = {
  id: string;
  label: string;
  kind: "Serif" | "Sans serif";
  /** CSS font-family value, with fallbacks. */
  family: string;
  href: string;
};

function fontsOfPair(pair: (typeof BRAND_FONT_PAIRS)[number]): SiteFont[] {
  if (!pair.googleFontsHref) return [];
  const query = pair.googleFontsHref.split("?")[1] ?? "";
  return query
    .split("&")
    .filter((part) => part.startsWith("family="))
    .map((part) => {
      const spec = part.slice("family=".length);
      const name = decodeURIComponent(spec.split(":")[0] ?? "").replace(/\+/g, " ");
      const family = [pair.displayFamily, pair.bodyFamily].find((f) => f.includes(`"${name}"`)) ?? `"${name}", sans-serif`;
      return {
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        label: name,
        kind: /(^|[^-])serif/.test(family.replace(/sans-serif/g, "")) ? "Serif" : "Sans serif",
        family,
        href: `https://fonts.googleapis.com/css2?family=${spec}&display=swap`,
      } satisfies SiteFont;
    });
}

export const SITE_FONTS: SiteFont[] = Array.from(
  new Map(BRAND_FONT_PAIRS.flatMap(fontsOfPair).map((font) => [font.id, font])).values(),
).sort((a, b) => a.label.localeCompare(b.label));

export function siteFont(id: string | undefined): SiteFont | undefined {
  return id ? SITE_FONTS.find((font) => font.id === id) : undefined;
}
