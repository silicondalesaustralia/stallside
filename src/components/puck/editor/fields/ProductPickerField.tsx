"use client";

import type { PuckSpikeMetadata } from "@/lib/puck/types";

type PickerProps = {
  value: string[];
  onChange: (value: string[]) => void;
  products: PuckSpikeMetadata["products"];
};

export default function ProductPickerField({
  value,
  onChange,
  products,
}: PickerProps) {
  const selected = new Set(value);

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
  }

  if (products.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        Add products to your shop first — they will appear here.
      </p>
    );
  }

  return (
    <ul className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-[var(--line)] p-2">
      {products.map((product) => (
        <li key={product.id}>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.has(product.id)}
              onChange={() => toggle(product.id)}
              className="size-4 rounded border-[var(--line)]"
            />
            <span className="font-medium text-[var(--field)]">{product.name}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}
