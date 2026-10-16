"use client";

import type { UpsellInput } from "./actions";
import ScopeChecklist, { type ScopeOption } from "./ScopeChecklist";

export default function UpsellScopeFields({
  value,
  onChange,
  categories,
  products,
}: {
  value: UpsellInput;
  onChange: (patch: Partial<UpsellInput>) => void;
  categories: ScopeOption[];
  products: ScopeOption[];
}) {
  return (
    <>
      <fieldset className="flex flex-col gap-4 rounded-lg border border-[var(--line)] p-4">
        <legend className="px-1 text-sm font-semibold">Show it when the cart has…</legend>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={value.sitewide}
            onChange={(e) => onChange({ sitewide: e.target.checked })}
            className="mt-0.5 size-4"
          />
          <span>
            <span className="font-medium">Anything (sitewide)</span>
            <span className="block text-xs text-[var(--muted)]">
              Shows on every cart unless a category or product upsell fits better.
            </span>
          </span>
        </label>
        <ScopeChecklist
          label="Categories"
          options={categories}
          selected={value.categoryIds}
          onChange={(categoryIds) => onChange({ categoryIds })}
          emptyText="No categories yet."
        />
        <ScopeChecklist
          label="Products"
          options={products}
          selected={value.productIds}
          onChange={(productIds) => onChange({ productIds })}
          emptyText="No products yet."
        />
        <p className="text-xs text-[var(--muted)]">
          If several upsells fit a cart, one picked for a product wins over one for a category, which wins over
          sitewide. Pre-order carts use pre-order add-ons instead.
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-2 rounded-lg border border-[var(--line)] p-4 text-sm">
        <legend className="px-1 font-semibold">Where shoppers see it</legend>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.showOnWebsite}
            onChange={(e) => onChange({ showOnWebsite: e.target.checked })}
            className="size-4"
          />
          Online store cart
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.showAtStall}
            onChange={(e) => onChange({ showAtStall: e.target.checked })}
            className="size-4"
          />
          Stall checkout (QR code at the stall)
        </label>
      </fieldset>
    </>
  );
}
