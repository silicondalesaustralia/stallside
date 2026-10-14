import { parseRichText, type RichInline } from "./parse";

function inlineText(nodes: RichInline[]): string {
  return nodes
    .map((n) => (n.t === "text" ? n.v : n.t === "br" ? "\n" : inlineText(n.c)))
    .join("");
}

/** Formatted text as plain words for SEO, Square, social posts and other text-only places. */
export function richTextToPlain(source: string | null | undefined): string {
  if (!source) return "";
  return parseRichText(source)
    .map((b) =>
      b.t === "p"
        ? inlineText(b.c)
        : b.items.map((item, i) => `${b.t === "ul" ? "•" : `${i + 1}.`} ${inlineText(item)}`).join("\n"),
    )
    .join("\n\n")
    .trim();
}

/** Plain text or null when empty, for nullable description fields. */
export function richTextToPlainOrNull(source: string | null | undefined): string | null {
  return richTextToPlain(source) || null;
}
