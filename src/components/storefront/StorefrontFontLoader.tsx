import { getFontPair } from "@/lib/website/brand-looks";

/** Loads Google Fonts stylesheet for a curated storefront font pair. */
export default function StorefrontFontLoader({
  fontPairId,
}: {
  fontPairId?: string | null;
}) {
  const pair = getFontPair(fontPairId);
  if (!pair?.googleFontsHref) return null;
  return <link rel="stylesheet" href={pair.googleFontsHref} />;
}
