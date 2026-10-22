"use client";

import { useState, useTransition } from "react";
import DashFormSection from "@/components/DashFormSection";
import { setProductGstFree } from "./product-gst-action";

export default function ProductGstCard({
  productId,
  gstFree,
  gstRegistered,
}: {
  productId: string;
  gstFree: boolean;
  gstRegistered: boolean;
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
      title="GST"
      hint={
        gstRegistered
          ? "Fresh fruit, veg, eggs, meat and plain bread are usually GST-free. Use Sync in Settings → GST to update past orders."
          : "Only used once you mark your business as GST registered in Settings."
      }
    >
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={checked}
          disabled={pending}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="font-semibold">GST-free item</span>
      </label>
      {message ? (
        <p className="text-xs text-[var(--muted)]">{message}</p>
      ) : null}
    </DashFormSection>
  );
}
