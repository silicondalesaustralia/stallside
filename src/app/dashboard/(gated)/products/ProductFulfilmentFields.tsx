"use client";

import { useState, useTransition } from "react";
import { saveProductFulfilmentOptions } from "@/app/dashboard/(gated)/products/fulfilment-actions";

type OptionRow = {
  id: string;
  label: string;
  kind: string;
  enabled: boolean;
  hasRestriction: boolean;
};

export default function ProductFulfilmentFields({
  productId,
  options,
}: {
  productId: string;
  options: OptionRow[];
}) {
  const [rows, setRows] = useState(options);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (options.length === 0) return null;

  function toggle(optionId: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === optionId ? { ...r, enabled: !r.enabled } : r,
      ),
    );
  }

  function save() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveProductFulfilmentOptions(
        productId,
        rows.map((r) => ({ optionId: r.id, enabled: r.enabled })),
      );
      if (result?.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Fulfilment options saved.");
    });
  }

  return (
    <div className="grid gap-3">
      <p className="text-sm text-[var(--muted)]">
        Choose which online pickup or delivery options this product appears on.
        Leave all on to allow every option.
      </p>
      <ul className="grid gap-2">
        {rows.map((row) => (
          <li key={row.id} className="flex items-start gap-3">
            <input
              id={`fulfil-${row.id}`}
              type="checkbox"
              checked={row.enabled}
              onChange={() => toggle(row.id)}
              className="mt-1"
            />
            <label htmlFor={`fulfil-${row.id}`} className="text-sm">
              <span className="font-medium text-[var(--field)]">{row.label}</span>
              <span className="ml-2 text-[var(--muted)]">({row.kind})</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold hover:border-[var(--leaf)] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save fulfilment options"}
        </button>
        {message ? (
          <p className="text-sm text-[var(--muted)]">{message}</p>
        ) : null}
      </div>
    </div>
  );
}
