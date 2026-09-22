"use client";

import { useState, useTransition } from "react";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { updateLinkedOwed, unlinkSupplierProduct } from "./link-actions";
import OwnerSupplierStockForm from "./OwnerSupplierStockForm";

export default function LinkedProductTermsForm({
  memberId,
  productId,
  memberName,
  owedCents,
  autoApprove,
}: {
  memberId: string;
  productId: string;
  memberName: string;
  owedCents: number;
  autoApprove: boolean;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSave(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateLinkedOwed(formData);
      if (result && "error" in result && result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Saved.");
    });
  }

  function onUnlink(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await unlinkSupplierProduct(formData);
      if (result && "error" in result && result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Unlinked.");
    });
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      <form action={onSave} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="memberId" value={memberId} />
        <input type="hidden" name="productId" value={productId} />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">You owe per unit</span>
          <input
            name="owed"
            required
            defaultValue={(owedCents / 100).toFixed(2)}
            className="w-28 rounded-lg border border-[var(--line)] px-3 py-2"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="autoApprove"
            value="1"
            defaultChecked={autoApprove}
          />
          Auto-add to stock
        </label>
        <button type="submit" disabled={pending} className={dashCtaClass}>
          {pending ? "Saving…" : "Save"}
        </button>
      </form>
      <form action={onUnlink}>
        <input type="hidden" name="memberId" value={memberId} />
        <input type="hidden" name="productId" value={productId} />
        <button type="submit" disabled={pending} className="text-sm underline">
          Stop linking
        </button>
      </form>
      <OwnerSupplierStockForm
        memberId={memberId}
        productId={productId}
        memberName={memberName}
      />
      {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
    </div>
  );
}
