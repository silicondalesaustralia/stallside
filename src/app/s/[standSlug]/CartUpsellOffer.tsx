"use client";

import { formatMoney } from "@/lib/public-product";

export default function CartUpsellOffer({
  name,
  priceCents,
  currency,
  onAdd,
}: {
  name: string;
  priceCents: number;
  currency: string;
  onAdd: () => void;
}) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4">
      <p className="text-sm font-medium">Add one more?</p>
      <p className="mt-1 text-base">
        {name} — {formatMoney(priceCents, currency)}
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
