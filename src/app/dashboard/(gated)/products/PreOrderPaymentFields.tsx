"use client";

import type { PreOrderPaymentTiming } from "@/lib/pre-order";

const radioClass = "size-4 accent-[var(--leaf)]";

export default function PreOrderPaymentFields({
  timing,
  onTiming,
  cardReady,
  deliver,
  defaultDepositPercent,
  collectionNoun,
}: {
  timing: PreOrderPaymentTiming;
  onTiming: (value: PreOrderPaymentTiming) => void;
  cardReady: boolean;
  deliver: boolean;
  defaultDepositPercent: number | null;
  collectionNoun: string;
}) {
  const option = (value: PreOrderPaymentTiming, label: string, disabled: boolean) => (
    <label className={`flex items-center gap-2 ${disabled ? "opacity-50" : ""}`}>
      <input
        type="radio"
        name="paymentTiming"
        value={value}
        checked={timing === value}
        disabled={disabled}
        onChange={() => onTiming(value)}
        className={radioClass}
      />
      {label}
    </label>
  );

  return (
    <div className="flex flex-col gap-2 text-sm">
      <span className="font-medium">How do customers pay?</span>
      <div className="flex flex-wrap items-center gap-3">
        {option("PAY_UPFRONT", "Pay in full now", !cardReady)}
        {option("DEPOSIT_THEN_BALANCE", "Deposit", !cardReady)}
        {option("PAY_AT_PICKUP", "Pay at pickup", deliver)}
        {timing === "DEPOSIT_THEN_BALANCE" ? (
          <label className="flex items-center gap-1">
            <input
              name="depositPercent"
              type="number"
              min={1}
              max={99}
              defaultValue={defaultDepositPercent ?? 30}
              className="w-16 rounded-lg border border-[var(--line)] bg-white px-2 py-1.5"
            />
            <span>% now, balance on {collectionNoun.toLowerCase()}</span>
          </label>
        ) : null}
      </div>
      {timing === "PAY_AT_PICKUP" ? (
        <p className="text-[var(--muted)]">
          Customers place their order now and pay you (cash or however you
          like) when they collect. Nothing is charged online, so no-shows
          aren&apos;t covered. Mark each order paid when you hand it over.
        </p>
      ) : null}
      {deliver ? (
        <p className="text-[var(--muted)]">
          Pay at pickup is only available when customers collect.
        </p>
      ) : null}
    </div>
  );
}
