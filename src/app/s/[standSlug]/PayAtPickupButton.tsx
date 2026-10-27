"use client";

import PaymentBrandIcon from "@/components/PaymentBrandIcon";
import SectionCopy from "@/components/studio/SectionCopy";
import { CHECKOUT_COPY } from "@/lib/storefront/checkout-copy";

/** Pre-order pages set to pay at pickup: place the order now, pay the owner on collection. */
export default function PayAtPickupButton({
  amountLabel,
  pending,
  disabled,
  onPlace,
}: {
  amountLabel: string;
  pending: boolean;
  disabled: boolean;
  onPlace: () => void;
}) {
  return (
    <>
      <p className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-base">
        <SectionCopy
          k="payAtPickupNote"
          fallback={CHECKOUT_COPY.payAtPickupNote}
          vars={{ amount: amountLabel }}
        />
      </p>
      <button
        type="button"
        disabled={pending || disabled}
        onClick={onPlace}
        className="flex items-center gap-4 rounded-[var(--radius)] bg-[var(--site-btn-bg,var(--leaf))] px-5 py-5 text-left text-xl font-semibold text-[var(--site-btn-ink,#fff)] disabled:opacity-50"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
          <PaymentBrandIcon brand="cash" className="size-7" />
        </span>
        {pending ? (
          <span>Placing order…</span>
        ) : (
          <SectionCopy k="payAtPickupButton" fallback={CHECKOUT_COPY.payAtPickupButton} />
        )}
      </button>
    </>
  );
}
