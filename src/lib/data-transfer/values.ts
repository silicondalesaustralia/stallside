import { zonedWallClockToUtc } from "@/lib/stand-timezone";

export const LIST_SEPARATOR = "|";

export function yesNo(value: boolean): string {
  return value ? "yes" : "no";
}

/** Blank → undefined (leave unchanged); otherwise yes/no/true/false/1/0. */
export function parseYesNo(raw: string | undefined): boolean | undefined | "invalid" {
  const v = (raw ?? "").trim().toLowerCase();
  if (!v) return undefined;
  if (["yes", "y", "true", "1"].includes(v)) return true;
  if (["no", "n", "false", "0"].includes(v)) return false;
  return "invalid";
}

/** "12.50" / "$12.50" → 1250. Blank → undefined. */
export function parseDollars(raw: string | undefined): number | undefined | "invalid" {
  const v = (raw ?? "").trim().replace(/^\$/, "").replace(/,/g, "");
  if (!v) return undefined;
  if (!/^\d+(\.\d{1,2})?$/.test(v)) return "invalid";
  return Math.round(Number(v) * 100);
}

export function parseWholeNumber(raw: string | undefined): number | undefined | "invalid" {
  const v = (raw ?? "").trim();
  if (!v) return undefined;
  if (!/^-?\d+$/.test(v)) return "invalid";
  return Number(v);
}

export function joinList(values: (string | null | undefined)[]): string {
  return values.filter((v): v is string => Boolean(v)).join(LIST_SEPARATOR);
}

export function splitList(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(LIST_SEPARATOR)
    .map((v) => v.trim())
    .filter(Boolean);
}

/** "YYYY-MM-DD HH:mm" (or with T) in the business timezone → UTC. */
export function parseLocalDateTime(raw: string | undefined, timeZone: string): Date | undefined | "invalid" {
  const v = (raw ?? "").trim();
  if (!v) return undefined;
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/.exec(v);
  if (!m) return "invalid";
  const [, y, mo, d, h, mi] = m.map(Number);
  return zonedWallClockToUtc(y, mo - 1, d, h, mi, 0, timeZone);
}

export function upperEnum<T extends string>(raw: string | undefined, allowed: readonly T[]): T | undefined | "invalid" {
  const v = (raw ?? "").trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (!v) return undefined;
  return (allowed as readonly string[]).includes(v) ? (v as T) : "invalid";
}
