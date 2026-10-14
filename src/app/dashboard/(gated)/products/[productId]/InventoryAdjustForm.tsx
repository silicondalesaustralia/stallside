"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { adjustInventory } from "../actions";

const FIELD = "rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";

/** Stock change applied straight away (logged with a reason). Unnamed fields so it never joins the product form. */
export default function InventoryAdjustForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [mode, setMode] = useState("increase");
  const [amount, setAmount] = useState("1");
  const [reason, setReason] = useState("Restocked");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function apply() {
    if (!/^\d+$/.test(amount.trim())) {
      setMessage("Enter a whole number.");
      return;
    }
    const formData = new FormData();
    formData.set("productId", productId);
    formData.set("mode", mode);
    formData.set("amount", amount.trim());
    formData.set("reason", reason);
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await adjustInventory(formData);
        if (result && "error" in result && result.error) {
          setMessage(result.error);
          return;
        }
        setMessage("Stock updated.");
        router.refresh();
      } catch (err) {
        console.error("[inventory adjust]", err);
        setMessage("Couldn't update stock. Try again.");
      }
    });
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      <select aria-label="Stock change" value={mode} onChange={(e) => setMode(e.target.value)} className={FIELD}>
        <option value="increase">Increase by</option>
        <option value="decrease">Decrease by</option>
        <option value="set">Set exact</option>
      </select>
      <input
        aria-label="Amount"
        type="number"
        min={0}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            apply();
          }
        }}
        className={FIELD}
      />
      <select aria-label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} className={`${FIELD} sm:col-span-2 lg:col-span-1 xl:col-span-2`}>
        <option>Restocked</option>
        <option>Cash sale without QR</option>
        <option>Spoiled/damaged</option>
        <option>Manual count correction</option>
        <option>Owner removed stock</option>
      </select>
      <button
        type="button"
        disabled={pending}
        onClick={apply}
        className="rounded-lg border border-[var(--leaf)] px-3 py-2 text-sm font-semibold text-[var(--leaf-dark)] hover:bg-[var(--wash)] disabled:opacity-60 sm:col-span-2 lg:col-span-1 xl:col-span-2"
      >
        {pending ? "Updating…" : "Apply stock change"}
      </button>
      {message ? <p className="text-sm text-[var(--muted)] sm:col-span-2 lg:col-span-1 xl:col-span-2">{message}</p> : null}
    </div>
  );
}
