"use client";

import { useEffect, useState, useTransition } from "react";
import CommunicationProductPicker from "./CommunicationProductPicker";
import CommunicationListMemberPicker from "./CommunicationListMemberPicker";
import { loadListMembers } from "../list-members";

type CustomerOpt = { id: string; name: string | null; email: string | null };
type ProductOpt = { id: string; name: string };
type ListOpt = { id: string; name: string };
type Member = { email: string };

export default function CommunicationAudienceFields({
  audienceType,
  setAudienceType,
  customers,
  products,
  lists,
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
  selectedProducts: string[];
  onToggleProduct: (id: string) => void;
  initialCustomerId: string | null;
  listId: string;
  onListIdChange: (id: string) => void;
  initialMembers: Member[];
}) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [selectedEmails, setSelectedEmails] = useState<string[]>(() =>
    initialMembers.map((m) => m.email),
  );
  const [loading, startLoad] = useTransition();

  useEffect(() => {
    if (audienceType !== "list" || !listId) {
      setMembers([]);
      setSelectedEmails([]);
      return;
    }
    let cancelled = false;
    startLoad(async () => {
      const result = await loadListMembers(listId);
      if (cancelled) return;
      const next = result.members ?? [];
      setMembers(next);
      setSelectedEmails(next.map((m) => m.email));
    });
    return () => {
      cancelled = true;
    };
  }, [audienceType, listId]);

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
        <>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">List</span>
            <select
              name="listId"
              required
              value={listId}
              onChange={(e) => onListIdChange(e.target.value)}
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
            >
              <option value="">Select list…</option>
              {lists.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          {listId ? (
            <CommunicationListMemberPicker
              members={members}
              selected={selectedEmails}
              onChange={setSelectedEmails}
              loading={loading}
            />
          ) : null}
        </>
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
