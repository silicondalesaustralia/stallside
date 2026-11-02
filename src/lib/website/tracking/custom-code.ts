import type { CustomHeadMeta, CustomHeadScript } from "./types";

export const CUSTOM_HEAD_MAX_CHARS = 20_000;
const MAX_SCRIPTS = 10;
const MAX_METAS = 10;

/** Meta names Vendl controls; custom code can't override them. */
const RESERVED_META = new Set(["viewport", "description", "robots", "theme-color", "referrer"]);

export type ParsedCustomHead = {
  scripts: CustomHeadScript[];
  metas: CustomHeadMeta[];
  warnings: string[];
};

function parseAttrs(raw: string): Map<string, string | true> {
  const attrs = new Map<string, string | true>();
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  for (const m of raw.matchAll(re)) {
    attrs.set(m[1].toLowerCase(), m[2] ?? m[3] ?? m[4] ?? true);
  }
  return attrs;
}

function safeScriptSrc(src: string): string | null {
  try {
    const url = new URL(src.startsWith("//") ? `https:${src}` : src);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function parseScripts(html: string, warnings: string[]): CustomHeadScript[] {
  const scripts: CustomHeadScript[] = [];
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    const attrs = parseAttrs(m[1]);
    const type = attrs.get("type");
    if (typeof type === "string" && !/^(text|application)\/javascript$|^module$/i.test(type)) {
      warnings.push(`Skipped a <script type="${type}"> (only JavaScript runs).`);
      continue;
    }
    const srcAttr = attrs.get("src");
    if (typeof srcAttr === "string") {
      const src = safeScriptSrc(srcAttr);
      if (!src) warnings.push(`Skipped script ${srcAttr}: it must load over https.`);
      else scripts.push({ src, async: attrs.has("async") || attrs.has("defer") });
      continue;
    }
    const inline = m[2].trim();
    if (inline) scripts.push({ inline, async: false });
  }
  return scripts;
}

function parseMetas(html: string, warnings: string[]): CustomHeadMeta[] {
  const metas: CustomHeadMeta[] = [];
  for (const m of html.matchAll(/<meta\b([^>]*?)\/?>/gi)) {
    const attrs = parseAttrs(m[1]);
    const name = attrs.get("name") ?? attrs.get("property");
    const content = attrs.get("content");
    if (typeof name !== "string" || typeof content !== "string") continue;
    if (RESERVED_META.has(name.toLowerCase())) {
      warnings.push(`Skipped <meta name="${name}">: Vendl sets that one for you.`);
      continue;
    }
    metas.push({ name: name.slice(0, 100), content: content.slice(0, 500) });
  }
  return metas;
}

/** Only <script> and <meta> tags are kept; everything else is ignored with a warning. */
export function parseCustomHeadCode(html: string): ParsedCustomHead {
  const warnings: string[] = [];
  const source = html.slice(0, CUSTOM_HEAD_MAX_CHARS);
  if (html.length > CUSTOM_HEAD_MAX_CHARS) warnings.push(`Only the first ${CUSTOM_HEAD_MAX_CHARS} characters are used.`);
  const withoutComments = source.replace(/<!--[\s\S]*?-->/g, "");
  const scripts = parseScripts(withoutComments, warnings);
  const metas = parseMetas(withoutComments.replace(/<script\b[\s\S]*?<\/script\s*>/gi, ""), warnings);
  const leftover = withoutComments
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<meta\b[^>]*>/gi, "")
    .replace(/<\/?noscript\b[^>]*>|<img\b[^>]*>/gi, "")
    .trim();
  if (leftover) warnings.push("Some code isn't a <script> or <meta> tag and was ignored.");
  if (scripts.length > MAX_SCRIPTS) warnings.push(`Only the first ${MAX_SCRIPTS} scripts are used.`);
  if (metas.length > MAX_METAS) warnings.push(`Only the first ${MAX_METAS} meta tags are used.`);
  return { scripts: scripts.slice(0, MAX_SCRIPTS), metas: metas.slice(0, MAX_METAS), warnings };
}
