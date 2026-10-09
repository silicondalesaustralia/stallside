"use client";

import type { PuckSpikeMetadata } from "@/lib/puck/types";

export default function CategoryPickerField({
  value,
  onChange,
  categories,
}: {
  value: string;
  onChange: (value: string) => void;
  categories: PuckSpikeMetadata["categories"];
}) {
  if (categories.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        No categories yet. Showing all products instead.
      </p>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
    >
      <option value="">Choose a category</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.title}
        </option>
      ))}
    </select>
  );
}
