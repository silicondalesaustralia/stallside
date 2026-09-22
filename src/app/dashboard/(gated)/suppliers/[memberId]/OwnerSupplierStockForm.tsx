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
      setMessage(`Added to ${memberName}'s stock.`);
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="mt-3 flex flex-wrap items-end gap-2 border-t border-[var(--line)] pt-3">
      <input type="hidden" name="memberId" value={memberId} />
      <input type="hidden" name="productId" value={productId} />
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Add {memberName}&apos;s stock</span>
        <input
          name="amount"
          type="number"
          min={1}
          required
          className="w-24 rounded-lg border border-[var(--line)] px-3 py-2"
        />
      </label>
      <button type="submit" disabled={pending} className={dashCtaClass}>
        {pending ? "Adding…" : "Add stock"}
      </button>
      {message ? <p className="w-full text-sm text-[var(--muted)]">{message}</p> : null}
    </form>
  );
}
