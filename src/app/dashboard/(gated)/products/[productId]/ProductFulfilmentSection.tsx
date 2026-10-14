import Link from "next/link";
import DashFormSection from "@/components/DashFormSection";
import { FULFILMENT_CHOICE_LABELS, type FulfilmentChoiceValue } from "@/lib/fulfilment/handover-choice";
import type { ShippingModeValue } from "@/lib/shipping/shipping-cost";

const CHOICES: FulfilmentChoiceValue[] = ["PICKUP", "DELIVERY", "BOTH"];

/** Pickup / shipping for this product (blank follows the business setting) and its per-item shipping cost. */
export default function ProductFulfilmentSection({
  value,
  standDefault,
  preOrderEligible,
  shippingCents,
  shippingMode,
  currency,
}: {
  value: FulfilmentChoiceValue | null;
  standDefault: FulfilmentChoiceValue;
  preOrderEligible: boolean;
  shippingCents: number | null;
  shippingMode: ShippingModeValue;
  currency: string;
}) {
  return (
    <DashFormSection title="Pickup & shipping">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold">How customers get it</span>
        <select
          name="fulfilment"
          defaultValue={value ?? ""}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
        >
          <option value="">Business setting ({FULFILMENT_CHOICE_LABELS[standDefault]})</option>
          {CHOICES.map((choice) => (
            <option key={choice} value={choice}>
              {FULFILMENT_CHOICE_LABELS[choice]}
            </option>
          ))}
        </select>
        <span className="text-xs text-[var(--muted)]">
          Shipping asks the customer for their address at checkout and is paid by card.
        </span>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold">Shipping cost per item ({currency})</span>
        <input
          name="shippingCost"
          inputMode="decimal"
          defaultValue={shippingCents ? (shippingCents / 100).toFixed(2) : ""}
          placeholder="0.00"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
        />
        <span className="text-xs text-[var(--muted)]">
          {shippingMode === "CUSTOM"
            ? "Charged for each one shipped."
            : "Only used when your shipping is set to Custom - per product."}{" "}
          <Link href="/dashboard/shipping" className="underline">
            Shipping settings
          </Link>
        </span>
      </label>
      {preOrderEligible ? (
        <p className="text-xs text-[var(--muted)]">
          On a pre-order page, the page&apos;s collect or deliver setting is used instead.
        </p>
      ) : null}
    </DashFormSection>
  );
}
