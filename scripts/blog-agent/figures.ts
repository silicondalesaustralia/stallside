export type PlacedImage = {
  url: string;
  width: number;
  height: number;
  alt: string;
  caption?: string | null;
  afterHeading: string;
};

/** The blog sanitizer escapes attribute values itself, so only strip characters that break the tag. */
function attrText(value: string): string {
  return value.replace(/["<>]/g, "").trim();
}

function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function figureHtml(image: PlacedImage): string {
  const caption = image.caption ? `<figcaption>${escapeText(image.caption)}</figcaption>` : "";
  return `<figure><img src="${attrText(image.url)}" alt="${attrText(image.alt)}" width="${image.width}" height="${image.height}" />${caption}</figure>`;
}

function plainText(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim().toLowerCase();
}

/** End offsets of each h2, with its plain text. */
function headings(html: string): Array<{ text: string; end: number }> {
  return [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => ({
    text: plainText(m[1] ?? ""),
    end: (m.index ?? 0) + m[0].length,
  }));
}

/** Insertion point: after the first paragraph that follows the heading (or the heading itself). */
function insertionPoint(html: string, headingEnd: number): number {
  const close = html.indexOf("</p>", headingEnd);
  const nextHeading = html.slice(headingEnd).search(/<h[23]\b/i);
  if (close >= 0 && (nextHeading < 0 || close < headingEnd + nextHeading)) return close + 4;
  return headingEnd;
}

/**
 * Place each image under its matching h2. Unmatched images go under the next unused h2,
 * so every image lands inside the article rather than being dropped.
 */
export function insertFigures(bodyHtml: string, images: PlacedImage[]): string {
  const found = headings(bodyHtml);
  const used = new Set<number>();
  const placements = images.map((image) => {
    const wanted = plainText(image.afterHeading);
    let index = found.findIndex((h, i) => !used.has(i) && (h.text === wanted || h.text.includes(wanted) || wanted.includes(h.text)));
    if (index < 0) index = found.findIndex((_, i) => !used.has(i) && i > 0);
    if (index >= 0) used.add(index);
    const at = index >= 0 ? insertionPoint(bodyHtml, found[index].end) : bodyHtml.length;
    return { at, html: figureHtml(image) };
  });

  return placements
    .sort((a, b) => b.at - a.at)
    .reduce((html, p) => `${html.slice(0, p.at)}${p.html}${html.slice(p.at)}`, bodyHtml);
}
