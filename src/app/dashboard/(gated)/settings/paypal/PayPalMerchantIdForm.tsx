"use client";

import { useState, useTransition } from "react";
import { saveManualPayPalMerchantId } from "./manual-connect-action";

export default function PayPalMerchantIdForm({
  merchantId,
}: {
  merchantId: string | null;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await saveManualPayPalMerchantId(formData);
      setMessage(result.error ?? "PayPal Merchant ID saved.");
    });
  }

  return (
    <form
      action={onSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm"
    >
      <label className="flex flex-col gap-1.5">
        <span className="font-semibold">PayPal Merchant Account ID</span>
        <span className="text-[var(--muted)]">
          In PayPal, go to Settings → Business information and copy the
          Merchant account ID (13 letters and numbers). Payments go straight
          to your PayPal account - Vendl takes no fee on PayPal.
        </span>
        <input
          name="merchantId"
          defaultValue={merchantId ?? ""}
          maxLength={20}
          autoComplete="off"
          placeholder="e.g. ABCD1234EFGH5"
          className="max-w-xs rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5 font-mono uppercase outline-none ring-[var(--leaf)] focus:ring-2"
        />
      </label>
      <p className="text-[var(--muted)]">
        Double-check the ID - PayPal payments go to whichever account this
        is. Refunds are made from your PayPal account. Clear the field and save
        to disconnect.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--leaf)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {message ? (
          <p className="text-sm text-[var(--muted)]">{message}</p>
        ) : null}
      </div>
    </form>
  );
}
