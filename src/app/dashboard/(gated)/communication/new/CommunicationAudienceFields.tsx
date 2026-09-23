"use client";

import CommunicationProductPicker from "./CommunicationProductPicker";
import CommunicationListAudience from "./CommunicationListAudience";
import CommunicationCustomerPicker from "./CommunicationCustomerPicker";

type CustomerOpt = { id: string; name: string | null; email: string | null };
type ProductOpt = { id: string; name: string };
type ListOpt = { id: string; name: string };
type PageOpt = { id: string; title: string };
type Member = { email: string };

const WHO_OPTIONS = [
  ["all_marketing", "Everyone opted into marketing"],
  ["list", "Saved list"],
  ["preorder_page", "Bought via a pre-order page"],
  ["product", "Bought these products"],
  ["customer", "One customer"],
] as const;

export default function CommunicationAudienceFields({
  audienceType,
  setAudienceType,
  customers,
  products,
  lists,
  preOrderPages,
  selectedProducts,
  onToggleProduct,
  initialCustomerId,
  listId,
  onListIdChange,
  initialMembers,
}: {
  audienceType: string;
  setAudienceType: (v: string) => void;
  customers: CustomerOpt[];
  products: ProductOpt[];
  lists: ListOpt[];
  preOrderPages: PageOpt[];
  selectedProducts: string[];
  onToggleProduct: (id: string) => void;
  initialCustomerId: string | null;
  listId: string;
  onListIdChange: (id: string) => void;
  initialMembers: Member[];
}) {
  return (
    <>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold">Who</legend>
        {WHO_OPTIONS.map(([value, label]) => (
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
        <CommunicationListAudience
          lists={lists}
          listId={listId}
          onListIdChange={onListIdChange}
          initialMembers={initialMembers}
        />
      ) : null}

      {audienceType === "preorder_page" ? (
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Pre-order page</span>
          <select
            name="preOrderPageId"
            required
            defaultValue=""
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          >
            <option value="">Select page…</option>
            {preOrderPages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          {preOrderPages.length === 0 ? (
            <span className="text-xs text-[var(--muted)]">
              No pre-order pages yet.
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
        <CommunicationCustomerPicker
          customers={customers}
          initialCustomerId={initialCustomerId}
        />
      ) : null}
    </>
  );
}
