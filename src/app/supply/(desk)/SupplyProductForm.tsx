"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { createSupplierProduct } from "./create-product";

export default function SupplyProductForm({ standId }: { standId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await createSupplierProduct(formData);
      if (result && "error" in result && result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Added. The owner has been notified.");
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="dash-card flex flex-col gap-3 p-4">
      <h2 className="font-semibold text-[var(--field)]">Add a product</h2>
      <input type="hidden" name="standId" value={standId} />
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Name</span>
        <input
          name="name"
          required
          maxLength={120}
          className="rounded-lg border border-[var(--line)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Description</span>
        <textarea
          name="description"
          maxLength={500}
          rows={2}
          className="rounded-lg border border-[var(--line)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Starting stock</span>
        <input
          name="stockQuantity"
          type="number"
          min={0}
          defaultValue={0}
          required
          className="rounded-lg border border-[var(--line)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Photo</span>
        <input name="image" type="file" accept="image/jpeg,image/png,image/webp" />
      </label>
      {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
      <button type="submit" disabled={pending} className={dashCtaClass}>
        {pending ? "Saving…" : "Add product"}
      </button>
    </form>
  );
}
