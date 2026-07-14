const ALLOWED = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
]);

function escapeText(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Convert plain text / Newlines into simple paragraphs when no HTML is present. */
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
 * Allowlist sanitize for owner-authored sign instructions.
 * Keeps basic formatting tags only; strips attributes and nested junk.
 */
export function sanitizeSignHtml(raw: string): string {
  const normalized = normalizeSignHtml(raw);
  if (!normalized) return "";

  let out = normalized
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?(script|style|iframe|object|embed|link|meta)[^>]*>/gi, "");

  out = out.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (full, tag: string, attrs: string) => {
    const name = tag.toLowerCase();
    if (!ALLOWED.has(name)) return "";
    if (name === "br") return "<br />";
    const closing = full.startsWith("</");
    if (closing) return `</${name}>`;
    // Drop all attributes (no href/onclick/style).
    void attrs;
    return `<${name}>`;
  });

  out = out.replace(/&(?!(amp|lt|gt|quot|nbsp|#\d+|#x[\da-f]+);)/gi, "&amp;");
  return out.trim().slice(0, 4000);
}
