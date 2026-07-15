"use client";

import { useState, useTransition } from "react";
import { adjustInventory } from "../products/actions";

export default function InventoryAdjustForm({ productId }: { productId: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    formData.set("productId", productId);
    setMessage(null);
    startTransition(async () => {
      const result = await adjustInventory(formData);
      if (result && "error" in result && result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Updated.");
    });
  }

  return (
    <form action={onSubmit} className="grid gap-3 sm:grid-cols-4">
      <select name="mode" defaultValue="increase" className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm">
        <option value="increase">Increase by</option>
        <option value="decrease">Decrease by</option>
        <option value="set">Set exact</option>
      </select>
      <input
        name="amount"
        type="number"
        min={0}
        required
        defaultValue={1}
        className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
      />
      <select name="reason" className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm">
        <option>Restocked</option>
        <option>Cash sale without QR</option>
        <option>Spoiled/damaged</option>
        <option>Manual count correction</option>
        <option>Owner removed stock</option>
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--leaf)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-60"
      >
        {pending ? "…" : "Apply"}
      </button>
      {message ? <p className="sm:col-span-4 text-sm text-[var(--muted)]">{message}</p> : null}
    </form>
  );
}
