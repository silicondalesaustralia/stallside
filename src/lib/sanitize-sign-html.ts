import { sanitizeStyleAttr } from "@/lib/sanitize-sign-styles";

const BASE_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "div",
  "span",
  "h2",
  "h3",
  "mark",
  "a",
]);

const EMPTY_BLOCK =
  /^<(?:p)(?:\s[^>]*)?>\s*(?:&nbsp;|\u00a0|\s|<br\s*\/?>)*<\/p>/i;
const EMPTY_BLOCK_END =
  /<(?:p)(?:\s[^>]*)?>\s*(?:&nbsp;|\u00a0|\s|<br\s*\/?>)*<\/p>$/i;

function escapeText(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function safeHref(href: string): string | null {
  const trimmed = href.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("mailto:") && trimmed.includes("@")) return trimmed;
  return null;
}

/** Drop empty paragraphs only at the start/end (editor artifacts). */
function stripEdgeEmptyParagraphs(html: string): string {
  let out = html.trim();
  let prev = "";
  while (out !== prev) {
    prev = out;
    out = out.replace(EMPTY_BLOCK, "").trimStart();
    out = out.replace(EMPTY_BLOCK_END, "").trimEnd();
  }
  return out;
}

/** Convert plain text / newlines into simple paragraphs when no HTML is present. */
export function normalizeSignHtml(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed;
  return trimmed
    .split(/\n+/)
    .map((line) => `<p>${escapeText(line)}</p>`)
    .join("");
}

/**
 * Allowlist sanitize for owner-authored sign HTML.
 * allowStyles keeps safe inline styles (colour, size, font, alignment, spacing).
 */
export function sanitizeSignHtml(raw: string, allowStyles = false): string {
  const normalized = normalizeSignHtml(raw);
  if (!normalized) return "";

  let out = normalized
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?(script|style|iframe|object|embed|link|meta)[^>]*>/gi, "");

  out = out.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (full, tag: string, attrs: string) => {
    const name = tag.toLowerCase();
    if (!BASE_TAGS.has(name)) return "";
    if (name === "br") return "<br />";
    const closing = full.startsWith("</");
    if (closing) return `</${name}>`;

    const parts: string[] = [];
    if (name === "a") {
      const hrefMatch = attrs.match(/\shref\s*=\s*("([^"]*)"|'([^']*)')/i);
      const href = safeHref(hrefMatch?.[2] ?? hrefMatch?.[3] ?? "");
      if (!href) return "";
      parts.push(`href="${href}"`, 'rel="noopener noreferrer"', 'target="_blank"');
    }

    if (allowStyles) {
      const styleMatch = attrs.match(/\sstyle\s*=\s*("([^"]*)"|'([^']*)')/i);
      const rawStyle = styleMatch?.[2] ?? styleMatch?.[3] ?? "";
      const style = rawStyle ? sanitizeStyleAttr(rawStyle) : "";
      if (style) parts.push(`style="${style}"`);
    }

    return parts.length ? `<${name} ${parts.join(" ")}>` : `<${name}>`;
  });

  out = stripEdgeEmptyParagraphs(out);
  out = out.replace(/&(?!(amp|lt|gt|quot|nbsp|#\d+|#x[\da-f]+);)/gi, "&amp;");
  return out.trim().slice(0, 8000);
}
