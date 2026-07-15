"use client";

import { localTransferForCurrency } from "@/lib/local-transfer";

export default function LocalTransferAliasFields({
  currency,
  alias,
  methodId,
}: {
  currency: string;
  alias: string | null;
  methodId: string | null;
}) {
  const method = localTransferForCurrency(currency);
  if (!method) return null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[var(--line)] bg-[var(--wash)] p-4">
      <input type="hidden" name="localTransferMethodId" value={method.id} />
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">{method.aliasLabel}</span>
        <input
          name="localTransferAlias"
          defaultValue={methodId === method.id ? (alias ?? "") : ""}
          placeholder={method.aliasPlaceholder}
          maxLength={120}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
        <span className="text-[var(--muted)]">{method.aliasHint}</span>
      </label>
      <p className="text-xs text-[var(--muted)]">
        Shown publicly on your stall checkout. Use your own PayID only. Leave blank to
        hide bank transfer at this stand.
      </p>
    </div>
  );
}
