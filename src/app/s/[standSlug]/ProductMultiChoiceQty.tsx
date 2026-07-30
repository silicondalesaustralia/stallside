"use client";

import type { PublicProductCard } from "@/lib/public-product";
import { formatMoney } from "@/lib/public-product";
import QtyStepper from "./QtyStepper";

export function choiceUnitPrice(
  product: PublicProductCard,
  priceDeltaCents: number,
): number {
  if (product.optionGroups.length === 1) {
    return priceDeltaCents > 0 ? priceDeltaCents : product.priceCents;
  }
  return product.priceCents + priceDeltaCents;
}

/** One option group: qty per flavour/size, not radio pick-one. */
export default function ProductMultiChoiceQty({
  product,
  group,
  currency,
  perChoiceQty,
  remaining,
  onChange,
}: {
  product: PublicProductCard;
  group: PublicProductCard["optionGroups"][number];
  currency: string;
  perChoiceQty: Record<string, number>;
  remaining: number;
  onChange: (choiceId: string, qty: number) => void;
}) {
  const multiPickCount = Object.values(perChoiceQty).reduce((s, n) => s + n, 0);
  const multiPickTotal = group.choices.reduce((sum, c) => {
    const q = perChoiceQty[c.id] ?? 0;
    return sum + choiceUnitPrice(product, c.priceDeltaCents) * q;
  }, 0);

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium">{group.name}</legend>
      <p className="text-sm text-[var(--muted)]">
        Set a quantity for each option you want.
      </p>
      {group.choices.map((c) => {
        const price = choiceUnitPrice(product, c.priceDeltaCents);
        const q = perChoiceQty[c.id] ?? 0;
        const others = multiPickCount - q;
        const maxForRow = Math.max(0, remaining - others);
        return (
          <div
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium">{c.name}</p>
              <p className="font-receipt text-[var(--stand-secondary,var(--ok))]">
                {formatMoney(price, currency)}
              </p>
            </div>
            {!product.soldOut ? (
              <QtyStepper
                value={q}
                max={maxForRow}
                onChange={(n) => onChange(c.id, n)}
              />
            ) : null}
          </div>
        );
      })}
      {multiPickCount > 0 ? (
        <p className="text-center font-receipt text-xl text-[var(--stand-secondary,var(--ok))]">
          {multiPickCount} item{multiPickCount === 1 ? "" : "s"} ·{" "}
          {formatMoney(multiPickTotal, currency)}
        </p>
      ) : null}
    </fieldset>
  );
}
