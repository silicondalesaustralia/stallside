import { isUnit, type Unit } from "./unit-convert";

export type ActionResult = { ok: true; message?: string; redirectTo?: string } | { error: string };

export function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export function optionalText(formData: FormData, key: string): string | null {
  const value = text(formData, key);
  return value === "" ? null : value;
}

/** Decimal ≥ 0 (or > 0 when `positive`); null when blank or invalid. */
export function decimal(formData: FormData, key: string, positive = false): number | null {
  const raw = text(formData, key);
  if (raw === "") return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0 || (positive && value === 0)) return null;
  return value;
}

/** Dollar input → cents; null when blank or invalid. */
export function cents(formData: FormData, key: string): number | null {
  const value = decimal(formData, key);
  return value == null ? null : Math.round(value * 100);
}

export function wholeNumber(formData: FormData, key: string): number | null {
  const value = decimal(formData, key);
  return value == null || !Number.isInteger(value) ? null : value;
}

export function unit(formData: FormData, key: string): Unit | null {
  const value = text(formData, key);
  return isUnit(value) ? value : null;
}

/** `YYYY-MM-DD` → Date at UTC midday (stable across timezones); null when blank or invalid. */
export function dateOnly(formData: FormData, key: string): Date | null {
  const raw = text(formData, key);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const date = new Date(`${raw}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function failure(context: string, error: unknown): { error: string } {
  console.error(context, error);
  return { error: error instanceof Error ? error.message : "Something went wrong." };
}
