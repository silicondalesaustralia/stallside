"use client";

import { useState, useTransition } from "react";
import DashFormSection from "@/components/DashFormSection";
import type { TaxConfig } from "@/lib/tax/config";
import { setProductGstFree } from "./product-gst-action";

export default function ProductGstCard({
  productId,
  gstFree,
  tax,
}: {
  productId: string;
  gstFree: boolean;
  tax: TaxConfig;
}) {
  const [checked, setChecked] = useState(gstFree);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onChange(next: boolean) {
    setChecked(next);
    setMessage(null);
    startTransition(async () => {
      const result = await setProductGstFree(productId, next);
      if ("error" in result) {
        setChecked(!next);
        setMessage(result.error);
        return;
      }
      setMessage("Saved.");
    });
  }

  return (
    <DashFormSection
      title={tax.name}
      hint={
        tax.applies
          ? tax.inclusive
            ? `Fresh fruit, veg, eggs, meat and plain bread are often ${tax.name}-free or zero-rated. Use Sync in Settings → Tax to update past orders.`
            : `Many states exempt groceries. Exempt items have no ${tax.name.toLowerCase()} added at checkout.`
          : "Only used once you turn on sales tax in Settings."
      }
    >
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={checked}
          disabled={pending}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="font-semibold">{tax.inclusive ? `${tax.name}-free item` : `Exempt from ${tax.name.toLowerCase()}`}</span>
      </label>
      {message ? (
        <p className="text-xs text-[var(--muted)]">{message}</p>
      ) : null}
    </DashFormSection>
  );
}
