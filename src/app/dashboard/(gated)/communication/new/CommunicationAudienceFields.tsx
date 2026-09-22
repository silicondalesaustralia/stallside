"use client";

import CommunicationProductPicker from "./CommunicationProductPicker";

type CustomerOpt = { id: string; name: string | null; email: string | null };
type ProductOpt = { id: string; name: string };
type ListOpt = { id: string; name: string };

export default function CommunicationAudienceFields({
  audienceType,
  setAudienceType,
  customers,
  products,
  lists,
  selectedProducts,
  onToggleProduct,
  initialCustomerId,
  initialListId,
}: {
  audienceType: string;
  setAudienceType: (v: string) => void;
  customers: CustomerOpt[];
  products: ProductOpt[];
  lists: ListOpt[];
  selectedProducts: string[];
  onToggleProduct: (id: string) => void;
  initialCustomerId: string | null;
  initialListId: string | null;
}) {
  return (
    <>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold">Who</legend>
        {(
          [
            ["all_marketing", "Everyone opted into marketing"],
            ["list", "Saved list"],
            ["product", "Bought these products"],
            ["customer", "One customer"],
          ] as const
        ).map(([value, label]) => (
          <label key={value} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="audienceType"
              value={value}
              checked={audienceType === value}
              onChange={() => setAudienceType(value)}
            />
            {label}
          </label>
        ))}
      </fieldset>

      {audienceType === "list" ? (
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">List</span>
          <select
            name="listId"
            required
            defaultValue={initialListId ?? ""}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          >
            <option value="">Select list…</option>
            {lists.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          {lists.length === 0 ? (
            <span className="text-xs text-[var(--muted)]">
              No lists yet — create one under Customers → Lists.
            </span>
          ) : null}
        </label>
      ) : null}

      {audienceType === "product" ? (
        <CommunicationProductPicker
          products={products}
          selected={selectedProducts}
          onToggle={onToggleProduct}
        />
      ) : null}

      {audienceType === "customer" ? (
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Customer</span>
          <select
            name="customerId"
            required
            defaultValue={initialCustomerId ?? ""}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          >
            <option value="">Select customer…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || c.email} {c.email ? `(${c.email})` : ""}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </>
  );
}
