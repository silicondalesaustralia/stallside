import { formatMoney } from "@/lib/money";
import { unitLabel, type Unit } from "./unit-convert";

const DISPLAY_SCALE: Partial<Record<Unit, { factor: number; unit: Unit }>> = {
  MG: { factor: 1_000_000, unit: "KG" },
  G: { factor: 1000, unit: "KG" },
  ML: { factor: 1000, unit: "L" },
};

/** Cost per base unit shown at a readable scale, e.g. "$1.85 / kg" instead of "$0.00185 / g". */
export function formatUnitCost(perBaseCents: number | null, baseUnit: Unit, currency: string): string {
  if (perBaseCents == null) return "No price";
  const scale = DISPLAY_SCALE[baseUnit];
  const value = (perBaseCents * (scale?.factor ?? 1)) / 100;
  const shown = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: value < 0.1 ? 4 : 2,
  }).format(value);
  return `${shown} / ${unitLabel(scale?.unit ?? baseUnit)}`;
}

/** Money with sub-cent precision kept out of the UI. */
export function money(cents: number, currency: string): string {
  return formatMoney(Math.round(cents), currency);
}

export function formatDay(date: Date, timeZone?: string): string {
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric", timeZone });
}
