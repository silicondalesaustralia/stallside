import { getFontPair } from "@/lib/website/brand-looks";

/** Loads Google Fonts stylesheets for the curated font pair and any site-wide font choices. */
export default function StorefrontFontLoader({
  fontPairId,
  extraHrefs = [],
}: {
  fontPairId?: string | null;
  extraHrefs?: string[];
}) {
  const pairHref = getFontPair(fontPairId)?.googleFontsHref;
  const hrefs = [pairHref, ...extraHrefs].filter((href, i, all): href is string => Boolean(href) && all.indexOf(href) === i);
  return (
    <>
      {hrefs.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
    </>
  );
}
