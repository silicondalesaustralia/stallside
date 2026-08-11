"use client";

import { formatMoney } from "@/lib/public-product";

export default function CartUpsellOffer({
  name,
  priceCents,
  compareAtCents = null,
  currency,
  onAdd,
}: {
  name: string;
  priceCents: number;
  compareAtCents?: number | null;
  currency: string;
  onAdd: () => void;
}) {
  const showStrike =
    compareAtCents != null && compareAtCents > priceCents;

  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4">
      <p className="text-sm font-medium">Get this right now at a discount</p>
      <p className="mt-1 text-base">
        {name} -{" "}
        {showStrike ? (
          <>
            <span className="text-[var(--muted)] line-through">
              {formatMoney(compareAtCents, currency)}
            </span>{" "}
            <span className="font-semibold">
              {formatMoney(priceCents, currency)}
            </span>
          </>
        ) : (
          formatMoney(priceCents, currency)
        )}
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-3 w-full rounded-[var(--radius-pill)] border border-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-[var(--leaf-dark)]"
      >
        Add to cart
      </button>
    </div>
  );
}
