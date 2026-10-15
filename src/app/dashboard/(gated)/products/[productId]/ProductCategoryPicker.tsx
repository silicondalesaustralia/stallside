"use client";

import { useState } from "react";
import type { CategoryChoice } from "./ProductOrganisationSection";

/** Category pills plus, when two or more are ticked, the main category that sets the product URL. */
export default function ProductCategoryPicker({
  categories,
  primaryCategoryId,
}: {
  categories: CategoryChoice[];
  primaryCategoryId: string | null;
}) {
  const [checked, setChecked] = useState(() => new Set(categories.filter((c) => c.checked).map((c) => c.id)));
  const [primary, setPrimary] = useState(primaryCategoryId);
  const ticked = categories.filter((c) => checked.has(c.id));
  const main = ticked.find((c) => c.id === primary) ?? ticked[0];

  function toggle(id: string, on: boolean) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <input type="hidden" name="categoriesShown" value="1" />
        {categories.map((c) => (
          <label
            key={c.id}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 py-1.5 has-[:checked]:border-[var(--leaf)] has-[:checked]:bg-[var(--wash)]"
          >
            <input
              type="checkbox"
              name="categoryId"
              value={c.id}
              checked={checked.has(c.id)}
              onChange={(e) => toggle(c.id, e.target.checked)}
            />
            {c.title}
          </label>
        ))}
      </div>
      {ticked.length > 1 ? (
        <label className="mt-2 flex flex-col gap-1">
          <span className="font-semibold">Main category</span>
          <select
            name="primaryCategoryId"
            value={main?.id ?? ""}
            onChange={(e) => setPrimary(e.target.value)}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          >
            {ticked.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <span className="text-xs text-[var(--muted)]">
            Sets the product&apos;s web address (/{"{category}"}/{"{product}"}), breadcrumbs and search listing.
          </span>
        </label>
      ) : (
        <input type="hidden" name="primaryCategoryId" value={main?.id ?? ""} />
      )}
    </>
  );
}
