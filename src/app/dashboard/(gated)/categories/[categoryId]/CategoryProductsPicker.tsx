"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setCategoryProducts } from "../category-product-actions";

type PickerProduct = { id: string; name: string; detail: string | null; checked: boolean };

export default function CategoryProductsPicker({
  categoryId,
  products,
}: {
  categoryId: string;
  products: PickerProduct[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const needle = filter.trim().toLowerCase();

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await setCategoryProducts(categoryId, formData);
      setMessage("error" in result ? result.error : "Saved.");
      router.refresh();
    });
  }

  if (products.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No products yet.</p>;
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-3">
      <input
        type="search"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter products"
        aria-label="Filter products"
        className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
      />
      <ul className="flex max-h-96 flex-col divide-y divide-[var(--line)] overflow-y-auto rounded-xl border border-[var(--line)] bg-white">
        {products.map((p) => (
          <li
            key={p.id}
            hidden={needle !== "" && !p.name.toLowerCase().includes(needle)}
          >
            <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm">
              <input type="checkbox" name="productId" value={p.id} defaultChecked={p.checked} />
              <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
              {p.detail ? <span className="text-xs text-[var(--muted)]">{p.detail}</span> : null}
            </label>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save products"}
        </button>
        {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
      </div>
    </form>
  );
}
