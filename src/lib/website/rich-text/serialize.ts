import type { RichBlock, RichInline } from "./parse";

/** Makes typed text literal so `*`, `_`, `[` etc. are never read as formatting. */
export function escapeRichText(text: string): string {
  return text.replace(/[\\*_[\]]/g, "\\$&");
}

/** A paragraph line that starts like a list item stays a paragraph. */
export function escapeLineStart(line: string): string {
  if (line.startsWith("- ")) return `\\${line}`;
  return line.replace(/^(\d+)([.)]) /, "$1\\$2 ");
}

/** Brackets and spaces would end the `(url)` part early. */
export function encodeHrefForMarkup(href: string): string {
  return href.replace(/[()\s]/g, (ch) => encodeURIComponent(ch));
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineHtml(nodes: RichInline[]): string {
  return nodes
    .map((n) => {
      if (n.t === "text") return escapeHtml(n.v);
      if (n.t === "br") return "<br>";
      if (n.t === "b") return `<strong>${inlineHtml(n.c)}</strong>`;
      if (n.t === "i") return `<em>${inlineHtml(n.c)}</em>`;
      return `<a href="${escapeHtml(n.href)}">${inlineHtml(n.c)}</a>`;
    })
    .join("");
}

/** HTML for the editor's contentEditable. Every text and href is escaped; only our own tags are emitted. */
export function richTextToHtml(blocks: RichBlock[]): string {
  return blocks
    .map((b) =>
      b.t === "p"
        ? `<p>${inlineHtml(b.c)}</p>`
        : `<${b.t}>${b.items.map((item) => `<li>${inlineHtml(item)}</li>`).join("")}</${b.t}>`,
    )
    .join("");
}