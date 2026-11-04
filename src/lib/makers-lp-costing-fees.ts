export const HOME_FEE_PRESETS = [
  { id: "free-card", label: "Card on Free (2.5% Vendl + ~1.75% + 30c)", feePct: 4.25, fixedFeeCents: 30 },
  { id: "pro-card", label: "Card on Pro (~1.75% + 30c)", feePct: 1.75, fixedFeeCents: 30 },
  { id: "cash", label: "Cash or bank transfer (no fees)", feePct: 0, fixedFeeCents: 0 },
] as const;

export type MakersLpFeePresetId = (typeof HOME_FEE_PRESETS)[number]["id"];

const AUD = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" });

/** Fixed locale so server and browser render the same text. */
export function formatAud(cents: number): string {
  return AUD.format(Math.round(cents) / 100);
}
