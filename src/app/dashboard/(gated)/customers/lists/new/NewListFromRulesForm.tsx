"use client";

import { useState, useTransition } from "react";
import { createListFromRules } from "../actions";
import CommunicationProductPicker from "@/app/dashboard/(gated)/communication/new/CommunicationProductPicker";

type ProductOpt = { id: string; name: string };

export default function NewListFromRulesForm({
  products,
}: {
  products: ProductOpt[];
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => {
        setMessage(null);
        startTransition(async () => {
          const result = await createListFromRules(fd);
          if (result?.error) setMessage(result.error);
        });
      }}
      className="flex flex-col gap-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5"
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">List name</span>
        <input
          name="name"
          required
          maxLength={120}
          placeholder="Egg buyers"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Description (optional)</span>
        <input
          name="description"
          maxLength={400}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>

      <div>
        <p className="mb-2 text-sm font-medium">Bought these products</p>
        <CommunicationProductPicker
          products={products}
          selected={selected}
          onToggle={(id) =>
            setSelected((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
            )
          }
        />
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Purchased within (days, optional)</span>
        <input
          name="purchasedWithinDays"
          type="number"
          min={1}
          max={3650}
          placeholder="Leave blank for all time"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="preOrderOnly" />
        Pre-order customers only
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="marketingConsentOnly" />
        Marketing consent only
      </label>

      {message ? <p className="text-sm text-[var(--warn)]">{message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : "Create list"}
      </button>
    </form>
  );
}
