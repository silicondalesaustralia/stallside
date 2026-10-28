"use client";

import type { PublicVariant } from "@/lib/product-variants/public-variant";
import { variantMatches } from "@/lib/product-variants/pick-variant";

/** Option buttons for a product's variants (Shopify-style: one row per option). */
export default function VariantPicker({
  optionNames,
  variants,
  picked,
  onPick,
}: {
  optionNames: string[];
  variants: PublicVariant[];
  picked: string[];
  onPick: (next: string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {optionNames.map((name, i) => {
        const values = [...new Set(variants.map((v) => v.values[i]).filter(Boolean))];
        return (
          <fieldset key={name} className="flex flex-col gap-2">
            <legend className="text-sm font-medium">
              {name}
              {picked[i] ? `: ${picked[i]}` : ""}
            </legend>
            <div className="flex flex-wrap gap-2">
              {values.map((value) => {
                const trial = picked.map((p, j) => (j === i ? value : p));
                const available = variants.some(
                  (v) => variantMatches(v, trial) && v.stockQuantity > 0,
                );
                const active = picked[i] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onPick(trial)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                      active
                        ? "border-[var(--leaf)] bg-[var(--panel)]"
                        : "border-[var(--line)] bg-[var(--panel)]"
                    } ${available ? "" : "text-[var(--muted)] line-through"}`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}