const TRUE_WORDS = new Set(["yes", "y", "true", "1", "taxable", "active", "published", "visible", "subscribed", "instock", "in stock"]);
const FALSE_WORDS = new Set(["no", "n", "false", "0", "-1", "none", "draft", "archived", "hidden", "unsubscribed", "not_subscribed", "never_subscribed", "outofstock", "out of stock", "private"]);

/** Loose yes/no across platforms. Blank or unknown → undefined. */
export function parseFlag(raw: string | undefined): boolean | undefined {
  const v = (raw ?? "").trim().toLowerCase();
  if (TRUE_WORDS.has(v)) return true;
  if (FALSE_WORDS.has(v)) return false;
  return undefined;
}

/** "$1,234.50" / "12" → cents. Blank or invalid → undefined. */
export function parseMoney(raw: string | undefined): number | undefined {
  const v = (raw ?? "").trim().replace(/[^0-9.\-]/g, "");
  if (!v) return undefined;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.round(n * 100);
}

/** Whole stock count. "Unlimited" → 9999; "OutOfStock" → 0; "InStock" → undefined (no count). */
export function parseStock(raw: string | undefined): number | undefined {
  const v = (raw ?? "").trim().toLowerCase();
  if (!v) return undefined;
  if (v === "unlimited") return 9999;
  if (/^out[\s_]?of[\s_]?stock$/.test(v)) return 0;
  const n = Number(v.replace(/,/g, ""));
  if (!Number.isFinite(n)) return undefined;
  return Math.max(0, Math.floor(n));
}

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

/** HTML product descriptions → plain text with paragraph breaks. */
export function htmlToText(raw: string | undefined): string {
  return (raw ?? "")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z#0-9]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
}

/** "/shop/dried-herbs" → "Dried herbs"; plain names pass through unchanged. */
export function slugLabel(raw: string | undefined): string {
  const v = (raw ?? "").trim();
  if (!/^[a-z0-9/_-]+$/.test(v)) return v;
  const last = v.split("/").filter(Boolean).pop() ?? "";
  const words = last.replace(/[-_]+/g, " ").trim();
  return words ? words[0].toUpperCase() + words.slice(1) : "";
}

/** First entry of a list cell split on any of the separators. */
export function firstOf(raw: string | undefined, separators: RegExp): string {
  return (raw ?? "").split(separators).map((s) => s.trim()).find(Boolean) ?? "";
}
