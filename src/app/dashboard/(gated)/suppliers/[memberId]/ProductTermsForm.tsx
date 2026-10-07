"use client";

import { useState, useTransition } from "react";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { saveSupplierTerms } from "./member-actions";

export default function ProductTermsForm({
  memberId,
  productId,
  priceCents,
  owedCents,
  archived,
}: {
  memberId: string;
  productId: string;
  priceCents: number;
  owedCents: number | null;
  archived: boolean;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await saveSupplierTerms(formData);
      if (result && "error" in result && result.error) {
        setMessage(result.error);
        return;
      }
      setMessage(archived ? "Published." : "Saved.");
    });
  }

  return (
    <form action={onSubmit} className="mt-2 flex flex-wrap items-end gap-2">
      <input type="hidden" name="memberId" value={memberId} />
      <input type="hidden" name="productId" value={productId} />
      {archived ? <input type="hidden" name="publish" value="1" /> : null}
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Retail price</span>
        <input
          name="price"
          required
          defaultValue={(priceCents / 100).toFixed(2)}
          className="w-28 rounded-lg border border-[var(--line)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">You owe per unit</span>
        <input
          name="owed"
          required
          defaultValue={((owedCents ?? 0) / 100).toFixed(2)}
          className="w-28 rounded-lg border border-[var(--line)] px-3 py-2"
        />
      </label>
      <button type="submit" disabled={pending} className={dashCtaClass}>
        {pending ? "Saving…" : archived ? "Publish" : "Save"}
      </button>
      {message ? <p className="w-full text-sm text-[var(--muted)]">{message}</p> : null}
    </form>
  );
}
