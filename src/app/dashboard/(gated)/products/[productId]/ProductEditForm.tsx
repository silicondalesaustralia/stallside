"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateProduct } from "../actions";

type ProductFields = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  lowStockThreshold: number;
  standName: string;
};

export default function ProductEditForm({ product }: { product: ProductFields }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const save = updateProduct.bind(null, product.id);
  const priceDefault = (product.priceCents / 100).toFixed(2);

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await save(formData);
        if (result && "error" in result && result.error) {
          setMessage(result.error);
          return;
        }
        setMessage("Saved.");
        router.refresh();
      } catch (error) {
        console.error("Product save failed", error);
        setMessage("Could not save product. Try again.");
      }
    });
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-[var(--muted)]">Stand: {product.standName}</p>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Product name</span>
        <input
          name="name"
          required
          defaultValue={product.name}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Description (optional)</span>
        <input
          name="description"
          defaultValue={product.description ?? ""}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Price ({product.currency})</span>
        <input
          name="price"
          required
          inputMode="decimal"
          defaultValue={priceDefault}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Low-stock threshold</span>
        <input
          name="lowStockThreshold"
          type="number"
          min={0}
          defaultValue={product.lowStockThreshold}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      {message ? (
        <p
          className={`text-sm ${
            message === "Saved." ? "text-[var(--leaf-dark)]" : "text-[var(--warn)]"
          }`}
        >
          {message}
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        <Link
          href="/dashboard/inventory"
          className="rounded-lg border border-[var(--line)] px-4 py-3 text-sm font-semibold text-[var(--field)]"
        >
          Adjust stock
        </Link>
      </div>
    </form>
  );
}
