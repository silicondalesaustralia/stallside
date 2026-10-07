"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { addSupplierStockAsOwner } from "./owner-stock-actions";

export default function OwnerSupplierStockForm({
  memberId,
  productId,
  memberName,
}: {
  memberId: string;
  productId: string;
  memberName: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await addSupplierStockAsOwner(formData);
      if (result && "error" in result && result.error) {
        setMessage(result.error);
        return;
      }
      setMessage(`Added to ${memberName}'s stock on the stall.`);
      router.refresh();
    });
  }

  return (
    <form
      action={onSubmit}
      className="mt-3 flex flex-col gap-2 rounded-lg bg-[var(--wash)] p-3"
    >
      <p className="text-sm font-semibold text-[var(--field)]">
        Add {memberName}&apos;s inventory
      </p>
      <p className="text-sm text-[var(--muted)]">
        Counts as their contribution on this shared product (same as if they
        added it on Supply).
      </p>
      <input type="hidden" name="memberId" value={memberId} />
      <input type="hidden" name="productId" value={productId} />
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Quantity</span>
          <input
            name="amount"
            type="number"
            min={1}
            required
            className="w-24 rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <button type="submit" disabled={pending} className={dashCtaClass}>
          {pending ? "Adding…" : "Add stock"}
        </button>
      </div>
      {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
    </form>
  );
}
