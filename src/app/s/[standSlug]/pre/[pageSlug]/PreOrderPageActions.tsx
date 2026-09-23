"use client";

import { formatMoney } from "@/lib/public-product";

export default function PreOrderPageActions({
  selectedCount,
  subtotalCents,
  currency,
  canOrder,
  error,
  collectionReminder,
  onCheckout,
  onAddToCart,
}: {
  selectedCount: number;
  subtotalCents: number;
  currency: string;
  canOrder: boolean;
  error: string | null;
  collectionReminder: string | null;
  onCheckout: () => void;
  onAddToCart: () => void;
}) {
  return (
    <div className="mt-4 border-t border-[var(--line)] pt-4">
      {selectedCount > 0 ? (
        <p className="text-[26px] font-semibold leading-none tracking-tight">
          {selectedCount} {selectedCount === 1 ? "item" : "items"}
          <span className="ml-2 text-[16px] font-medium text-[var(--muted)]">
            · Subtotal {formatMoney(subtotalCents, currency)}
          </span>
        </p>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          Choose a quantity to continue
        </p>
      )}
      {error ? (
        <p className="mt-3 text-sm text-[var(--gone)]">{error}</p>
      ) : null}
      <div className="mt-4 flex flex-col gap-2.5">
        <button
          type="button"
          disabled={!canOrder}
          onClick={onCheckout}
          className="flex min-h-11 w-full items-center justify-center rounded-lg bg-[var(--pd-action)] px-4 py-3 text-base font-semibold text-[var(--pd-action-text)] disabled:opacity-40"
        >
          Add &amp; checkout
        </button>
        <button
          type="button"
          disabled={!canOrder}
          onClick={onAddToCart}
          className="flex min-h-11 w-full items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--wash)] px-4 py-3 text-base font-semibold disabled:opacity-40"
        >
          Add to cart
        </button>
      </div>
      {collectionReminder ? (
        <p className="mt-4 text-[13px] leading-snug text-[var(--muted)]">
          {collectionReminder}
        </p>
      ) : null}
    </div>
  );
}
