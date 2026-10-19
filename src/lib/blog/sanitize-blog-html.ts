const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "hr",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "code",
  "pre",
  "blockquote",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "h4",
  "a",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
]);

const VOID_TAGS = new Set(["br", "hr", "img"]);

export const BLOG_HTML_MAX_LENGTH = 200_000;

function attrValue(attrs: string, name: string): string | null {
  const match = attrs.match(
    new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"),
  );
  if (!match) return null;
  return (match[2] ?? match[3] ?? "").trim();
}

function escapeAttr(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function safeHref(href: string): string | null {
  if (/^https?:\/\//i.test(href)) return href;
  if (/^mailto:[^\s@]+@[^\s@]+$/i.test(href)) return href;
  if (/^\/(?!\/)/.test(href) || href.startsWith("#")) return href;
  return null;
}

function safeSrc(src: string): string | null {
  if (/^https:\/\//i.test(src)) return src;
  if (/^\/(?!\/)/.test(src)) return src;
  return null;
}

function renderAnchor(attrs: string): string {
  const href = safeHref(attrValue(attrs, "href") ?? "");
  if (!href) return "<a>";
  const external = /^https?:\/\//i.test(href) && !/vendl\.app/i.test(href);
  const rel = external ? ' rel="noopener noreferrer" target="_blank"' : "";
  return `<a href="${escapeAttr(href)}"${rel}>`;
}

function renderImage(attrs: string): string {
  const src = safeSrc(attrValue(attrs, "src") ?? "");
  if (!src) return "";
  const alt = attrValue(attrs, "alt") ?? "";
  const parts = [`src="${escapeAttr(src)}"`, `alt="${escapeAttr(alt)}"`];
  for (const dim of ["width", "height"]) {
    const value = attrValue(attrs, dim);
    if (value && /^\d{1,4}$/.test(value)) parts.push(`${dim}="${value}"`);
  }
  parts.push('loading="lazy"');
  return `<img ${parts.join(" ")} />`;
}

/** Allowlist sanitizer for admin/agent-authored blog HTML. No inline styles or scripts. */
export function sanitizeBlogHtml(raw: string): string {
  if (!raw.trim()) return "";
  let out = raw
    .slice(0, BLOG_HTML_MAX_LENGTH)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(
      /<(script|style|iframe|object|embed|noscript|template)[^>]*>[\s\S]*?<\/\1>/gi,
      "",
    )
    .replace(/<\/?(script|style|iframe|object|embed|link|meta|base|form|input)[^>]*>/gi, "");

  out = out.replace(/<\/?([a-z][a-z0-9]*)([^>]*)>/gi, (full, tag: string, attrs: string) => {
    const name = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(name)) return "";
    if (full.startsWith("</")) return VOID_TAGS.has(name) ? "" : `</${name}>`;
    if (name === "a") return renderAnchor(attrs);
    if (name === "img") return renderImage(attrs);
    if (VOID_TAGS.has(name)) return `<${name} />`;
    if (name === "th" || name === "td") {
      const scope = attrValue(attrs, "scope");
      return scope && /^(row|col)$/i.test(scope) ? `<${name} scope="${scope}">` : `<${name}>`;
    }
    if (name === "h2") {
      const id = attrValue(attrs, "id");
      return id && /^[a-z0-9-]{1,80}$/.test(id) ? `<h2 id="${id}">` : "<h2>";
    }
    return `<${name}>`;
  });

  return out.replace(/&(?!(amp|lt|gt|quot|apos|nbsp|#\d+|#x[\da-f]+);)/gi, "&amp;").trim();
}

/** Plain-text word count for schema + admin display. */
export function blogHtmlWordCount(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ");
  return text.split(/\s+/).filter(Boolean).length;
}
