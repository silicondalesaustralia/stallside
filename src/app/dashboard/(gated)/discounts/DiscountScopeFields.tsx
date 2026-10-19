"use client";

import ScopeChecklist, { type ScopeOption } from "../upsells/ScopeChecklist";
import type { DiscountInput } from "@/lib/discounts/input";

export default function DiscountScopeFields({
  value,
  onChange,
  categories,
  products,
}: {
  value: DiscountInput;
  onChange: (patch: Partial<DiscountInput>) => void;
  categories: ScopeOption[];
  products: ScopeOption[];
}) {
  return (
    <>
      <fieldset className="flex flex-col gap-4 rounded-lg border border-[var(--line)] p-4">
        <legend className="px-1 text-sm font-semibold">Applies to</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="discount-scope"
            checked={value.wholeOrder}
            onChange={() => onChange({ wholeOrder: true })}
            className="size-4"
          />
          The whole order
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="discount-scope"
            checked={!value.wholeOrder}
            onChange={() => onChange({ wholeOrder: false })}
            className="size-4"
          />
          Only some categories or products
        </label>
        {!value.wholeOrder ? (
          <>
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
          </>
        ) : null}
      </fieldset>

      <fieldset className="flex flex-col gap-2 rounded-lg border border-[var(--line)] p-4 text-sm">
        <legend className="px-1 font-semibold">Where shoppers can use it</legend>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.showOnWebsite}
            onChange={(e) => onChange({ showOnWebsite: e.target.checked })}
            className="size-4"
          />
          Online store checkout
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
