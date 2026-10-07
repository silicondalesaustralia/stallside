"use client";

import { useState, useTransition } from "react";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { linkSupplierProduct } from "./link-actions";

type ProductOption = { id: string; name: string };

export default function LinkProductForm({
  memberId,
  products,
}: {
  memberId: string;
  products: ProductOption[];
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (products.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        Add a product on this stand first, then link it here so they can top up
        your stock.
      </p>
    );
  }

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await linkSupplierProduct(formData);
      if (result && "error" in result && result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Linked. They can add stock from Supply.");
    });
  }

  return (
    <form action={onSubmit} className="dash-card flex flex-col gap-3 p-4">
      <h2 className="font-semibold text-[var(--field)]">
        Let them add stock to one of your products
      </h2>
      <p className="text-sm text-[var(--muted)]">
        Shoppers still see your product. Their contributions go into the same
        stock. Sales are attributed oldest stock first.
      </p>
      <input type="hidden" name="memberId" value={memberId} />
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Your product</span>
        <select
          name="productId"
          required
          className="rounded-lg border border-[var(--line)] px-3 py-2"
          defaultValue=""
        >
          <option value="" disabled>
            Choose…
          </option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">You owe per unit</span>
        <input
          name="owed"
          required
          defaultValue="0.00"
          className="w-28 rounded-lg border border-[var(--line)] px-3 py-2"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="autoApprove" value="1" defaultChecked />
        Add to stock straight away (no approve step)
      </label>
      <button type="submit" disabled={pending} className={dashCtaClass}>
        {pending ? "Saving…" : "Link product"}
      </button>
      {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
    </form>
  );
}
