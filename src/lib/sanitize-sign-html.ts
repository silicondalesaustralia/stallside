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

const STYLE_PROPS = new Set([
  "color",
  "background-color",
  "font-size",
  "font-family",
  "font-weight",
  "font-style",
  "text-align",
  "text-decoration",
  "text-transform",
  "letter-spacing",
  "line-height",
]);

function escapeText(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function sanitizeStyleValue(prop: string, value: string): string | null {
  const v = value.trim().toLowerCase();
  if (!v || /expression|url\s*\(|javascript:|@import/i.test(v)) return null;
  if (prop === "color" || prop === "background-color") {
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) return v;
    if (/^rgba?\([\d\s.,%]+\)$/.test(v)) return v;
    if (/^[a-z]+$/.test(v)) return v;
    return null;
  }
  if (prop === "font-size" || prop === "letter-spacing" || prop === "line-height") {
    if (/^\d+(\.\d+)?(px|em|rem|%|pt)$/.test(v)) return v;
    return null;
  }
  if (prop === "font-family") {
    if (/^[a-z0-9\s,"'\-]+$/i.test(value.trim())) return value.trim();
    return null;
  }
  if (prop === "font-weight") {
    if (/^(bold|bolder|normal|[1-9]00)$/.test(v)) return v;
    return null;
  }
  if (prop === "font-style") {
    if (/^(normal|italic|oblique)$/.test(v)) return v;
    return null;
  }
  if (prop === "text-align") {
    if (/^(left|right|center|justify)$/.test(v)) return v;
    return null;
  }
  if (prop === "text-decoration") {
    if (/^(none|underline|line-through)$/.test(v)) return v;
    return null;
  }
  if (prop === "text-transform") {
    if (/^(none|uppercase|lowercase|capitalize)$/.test(v)) return v;
    return null;
  }
  return null;
}

function sanitizeStyleAttr(style: string): string {
  return style
    .split(";")
    .map((part) => {
      const idx = part.indexOf(":");
      if (idx < 0) return "";
      const prop = part.slice(0, idx).trim().toLowerCase();
      const value = part.slice(idx + 1).trim();
      if (!STYLE_PROPS.has(prop)) return "";
      const safe = sanitizeStyleValue(prop, value);
      return safe ? `${prop}: ${safe}` : "";
    })
    .filter(Boolean)
    .join("; ");
}

function safeHref(href: string): string | null {
  const trimmed = href.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("mailto:") && trimmed.includes("@")) return trimmed;
  return null;
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
 * allowStyles keeps safe inline styles from TipTap (colour, size, font).
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

  out = out.replace(/&(?!(amp|lt|gt|quot|nbsp|#\d+|#x[\da-f]+);)/gi, "&amp;");
  return out.trim().slice(0, 8000);
}
