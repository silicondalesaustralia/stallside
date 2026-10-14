/**
 * Section body text with light formatting, stored as plain text:
 * `**bold**`, `_italic_`, `[label](url)`, `- ` bullets and `1. ` numbered lines.
 * Blank lines separate paragraphs; a single newline is a line break. Plain text
 * from before formatting existed parses to the same words.
 */
export type RichInline =
  | { t: "text"; v: string }
  | { t: "br" }
  | { t: "b"; c: RichInline[] }
  | { t: "i"; c: RichInline[] }
  | { t: "a"; href: string; c: RichInline[] };

export type RichBlock = { t: "p"; c: RichInline[] } | { t: "ul" | "ol"; items: RichInline[][] };

/** Characters a backslash makes literal (see `escapeRichText`). */
const ESCAPABLE = /[\\*_[\]\-.]/;
const BULLET = /^- /;
const NUMBERED = /^\d+[.)] /;

/** Links may only go to web pages, email, phone, or a path on this site. */
export function safeHref(raw: string): string | null {
  const href = raw.trim();
  if (/^(https?:\/\/[^\s]+|mailto:[^\s]+|tel:[+\d][\d\s-]*)$/i.test(href)) return href;
  if (/^\/(?!\/)[^\s]*$/.test(href) || /^#[\w-]+$/.test(href)) return href;
  return null;
}

/** What a seller types in the link box: adds https:// to bare domains and mailto: to emails. */
export function normaliseLinkInput(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  if (/^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/.test(v)) return `mailto:${v}`;
  if (/^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+([/?#]\S*)?$/i.test(v)) return safeHref(`https://${v}`);
  return safeHref(v);
}

export function parseRichText(source: string): RichBlock[] {
  const blocks: RichBlock[] = [];
  for (const chunk of source.replace(/\r\n?/g, "\n").split(/\n{2,}/)) {
    if (!chunk.trim()) continue;
    const lines = chunk.replace(/^\n+|\n+$/g, "").split("\n");
    const listType = lines.every((l) => BULLET.test(l)) ? "ul" : lines.every((l) => NUMBERED.test(l)) ? "ol" : null;
    if (listType) {
      const marker = listType === "ul" ? BULLET : NUMBERED;
      blocks.push({ t: listType, items: lines.map((l) => parseInline(l.replace(marker, ""))) });
      continue;
    }
    const c: RichInline[] = [];
    lines.forEach((line, i) => {
      if (i > 0) c.push({ t: "br" });
      c.push(...parseInline(line));
    });
    blocks.push({ t: "p", c });
  }
  return blocks;
}

function isWordChar(ch: string | undefined): boolean {
  return Boolean(ch && /[\p{L}\p{N}]/u.test(ch));
}

function findClose(s: string, token: string, from: number): number {
  for (let i = from; i <= s.length - token.length; i++) {
    if (s[i] === "\\") {
      i++;
      continue;
    }
    if (s.startsWith(token, i)) return i;
  }
  return -1;
}

export function parseInline(s: string): RichInline[] {
  const out: RichInline[] = [];
  let buf = "";
  const flush = () => {
    if (buf) out.push({ t: "text", v: buf });
    buf = "";
  };
  for (let i = 0; i < s.length; ) {
    const ch = s[i]!;
    if (ch === "\\" && ESCAPABLE.test(s[i + 1] ?? "")) {
      buf += s[i + 1];
      i += 2;
      continue;
    }
    if (s.startsWith("**", i)) {
      const end = findClose(s, "**", i + 2);
      if (end > i + 2) {
        flush();
        out.push({ t: "b", c: parseInline(s.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }
    if (ch === "_" && !isWordChar(s[i - 1])) {
      const end = findClose(s, "_", i + 1);
      if (end > i + 1 && !isWordChar(s[end + 1])) {
        flush();
        out.push({ t: "i", c: parseInline(s.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }
    if (ch === "[") {
      const close = findClose(s, "]", i + 1);
      const paren = close > i + 1 && s[close + 1] === "(" ? s.indexOf(")", close + 2) : -1;
      const href = paren > close + 2 ? safeHref(s.slice(close + 2, paren)) : null;
      if (href) {
        flush();
        out.push({ t: "a", href, c: parseInline(s.slice(i + 1, close)) });
        i = paren + 1;
        continue;
      }
    }
    buf += ch;
    i++;
  }
  flush();
  return out;
}
