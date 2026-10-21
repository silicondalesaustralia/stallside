import { getFontPair } from "@/lib/website/brand-looks";
import type { ElementFont } from "@/lib/website/sections/element-style";
import { siteFont } from "./site-fonts";
import type { SiteStyle } from "./site-style";

/** What a font picker previews: the font's name, its CSS family and the stylesheet that loads it. */
export type FontSample = { name: string; family: string; href: string | null };

const GENERIC: Record<"sans" | "serif" | "mono", FontSample> = {
  sans: { name: "Sans serif", family: "ui-sans-serif, system-ui, sans-serif", href: null },
  serif: { name: "Serif", family: 'ui-serif, Georgia, "Times New Roman", serif', href: null },
  mono: { name: "Monospace", family: "ui-monospace, monospace", href: null },
};

function firstFamilyName(family: string): string | null {
  return family.match(/"([^"]+)"/)?.[1] ?? null;
}

/** The site-wide heading or text font, falling back to the template's font pair. */
export function siteFontSample(role: "heading" | "body", style: SiteStyle, fontPairId: string | null | undefined): FontSample {
  const chosen = siteFont(role === "heading" ? style.headingFont : style.bodyFont);
  if (chosen) return { name: chosen.label, family: chosen.family, href: chosen.href };
  const pair = getFontPair(fontPairId);
  const family = (role === "heading" ? pair?.displayFamily : pair?.bodyFamily) ?? (role === "heading" ? "var(--font-display)" : "var(--font-body)");
  const name = firstFamilyName(family);
  return { name: name ? `Template default (${name})` : "Template default", family, href: pair?.googleFontsHref || null };
}

/** A section-level font choice (heading, text, sans, serif or mono), resolved to what it shows. */
export function fontChoiceSample(choice: ElementFont, style: SiteStyle, fontPairId: string | null | undefined): FontSample {
  if (choice === "heading" || choice === "body") {
    const site = siteFontSample(choice, style, fontPairId);
    const label = choice === "heading" ? "Heading font" : "Text font";
    return { ...site, name: `${label}: ${site.name.replace(/^Template default \((.+)\)$/, "$1")}` };
  }
  return GENERIC[choice];
}
