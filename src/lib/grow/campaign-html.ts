/** Escape text for safe HTML email embedding. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const ALLOWED = new Set([
  "b",
  "strong",
  "i",
  "em",
  "u",
  "a",
  "br",
  "p",
  "div",
  "ul",
  "ol",
  "li",
  "span",
]);

function safeHref(raw: string): string | null {
  const url = raw.trim();
  if (!/^(https?:\/\/|mailto:)/i.test(url)) return null;
  if (/[\s<>"']/.test(url)) return null;
  return url;
}

/** Allowlist sanitizer for campaign body HTML from the composer. */
export function sanitizeCampaignHtml(html: string): string {
  let s = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(
      /<\/?(script|style|iframe|object|embed|form|input|button|meta|link|svg|math)[^>]*>/gi,
      "",
    )
    .replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s+style\s*=\s*("[^"]*"|'[^']*')/gi, "");

  s = s.replace(/<\/?([a-z0-9]+)(\s[^>]*)?>/gi, (match, tag: string, attrs = "") => {
    const t = tag.toLowerCase();
    if (!ALLOWED.has(t)) return "";
    if (t === "br") return "<br/>";
    if (match.startsWith("</")) return `</${t}>`;
    if (t === "a") {
      const hrefMatch = /href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(
        attrs,
      );
      const raw = (hrefMatch?.[2] ?? hrefMatch?.[3] ?? hrefMatch?.[4] ?? "").trim();
      const href = safeHref(raw);
      return href ? `<a href="${escapeHtml(href)}">` : "<span>";
    }
    return `<${t}>`;
  });

  return s.trim();
}

export function campaignBodyHasText(html: string): boolean {
  return (
    sanitizeCampaignHtml(html)
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .trim().length > 0
  );
}

/** Render stored body for email (HTML or legacy plain text). */
export function campaignBodyToEmailHtml(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) return "";
  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    return sanitizeCampaignHtml(trimmed);
  }
  return escapeHtml(trimmed).replace(/\n/g, "<br/>");
}
