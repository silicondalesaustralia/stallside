"use client";

import type { DraftOption } from "@/lib/product-variants/variant-draft";
import { MAX_VARIANT_OPTIONS } from "@/lib/product-variants/variant-title";

const input = "rounded-lg border border-[var(--line)] bg-white px-3 py-2";

export default function VariantOptionFields({
  options,
  onChange,
}: {
  options: DraftOption[];
  onChange: (options: DraftOption[]) => void;
}) {
  function update(i: number, patch: Partial<DraftOption>) {
    onChange(options.map((o, j) => (j === i ? { ...o, ...patch } : o)));
  }

  return (
    <div className="flex flex-col gap-2">
      {options.map((option, i) => (
        <div key={i} className="flex flex-wrap items-end gap-2">
          <label className="flex w-36 flex-col gap-1 text-sm">
            <span className="font-medium">Option name</span>
            <input
              value={option.name}
              maxLength={40}
              placeholder={i === 0 ? "Size" : "Colour"}
              onChange={(e) => update(i, { name: e.target.value })}
              className={input}
            />
          </label>
          <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm">
            <span className="font-medium">Values (comma separated)</span>
            <input
              value={option.values}
              placeholder={i === 0 ? "Small, Medium, Large" : "Red, Blue"}
              onChange={(e) => update(i, { values: e.target.value })}
              className={input}
            />
          </label>
          <button
            type="button"
            className="pb-2 text-sm text-[var(--gone)] underline"
            onClick={() => onChange(options.filter((_, j) => j !== i))}
          >
            Remove
          </button>
        </div>
      ))}
      {options.length < MAX_VARIANT_OPTIONS ? (
        <button
          type="button"
          className="text-left text-sm font-semibold text-[var(--leaf-dark)] underline"
          onClick={() => onChange([...options, { name: "", values: "" }])}
        >
          Add option
        </button>
      ) : null}
    </div>
  );
}
