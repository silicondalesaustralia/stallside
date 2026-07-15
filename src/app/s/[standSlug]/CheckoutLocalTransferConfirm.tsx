"use client";

import { useState } from "react";

type Props = {
  amountLabel: string;
  aliasLabel: string;
  alias: string;
  buttonLabel: string;
  pending: boolean;
  onConfirm: () => void;
  onBack: () => void;
};

export default function CheckoutLocalTransferConfirm({
  amountLabel,
  aliasLabel,
  alias,
  buttonLabel,
  pending,
  onConfirm,
  onBack,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function copyAlias() {
    try {
      await navigator.clipboard.writeText(alias);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-5">
      <p className="text-lg text-[var(--muted)]">Pay {amountLabel} by {buttonLabel.replace(/^Pay with /i, "")}</p>
      <p className="font-receipt text-5xl font-semibold tracking-tight">{amountLabel}</p>
      <div>
        <p className="text-sm font-medium text-[var(--muted)]">{aliasLabel}</p>
        <p className="mt-1 break-all font-receipt text-2xl font-semibold tracking-tight">
          {alias}
        </p>
        <button
          type="button"
          onClick={copyAlias}
          className="mt-2 rounded-[var(--radius-pill)] border border-[var(--line)] px-4 py-2 text-sm font-semibold"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="text-lg leading-snug text-[var(--muted)]">
        Open your banking app, pay the exact amount, then come back and confirm.
        This marks the sale as paid; the payment is not verified by Stallside.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={onConfirm}
        className="w-full rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-4 text-xl font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Logging…" : `I've paid ${amountLabel}`}
      </button>
      <button
        type="button"
        onClick={onBack}
        className="w-full rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-5 py-4 text-lg font-semibold text-[var(--ink)]"
      >
        Back
      </button>
    </div>
  );
}
