import Link from "next/link";
import DashFormSection from "@/components/DashFormSection";
import { FULFILMENT_CHOICE_LABELS, type FulfilmentChoiceValue } from "@/lib/fulfilment/handover-choice";

const CHOICES: FulfilmentChoiceValue[] = ["PICKUP", "DELIVERY", "BOTH"];

/** Pickup / delivery for this product; blank follows the business's site-wide setting. */
export default function ProductFulfilmentSection({
  value,
  standDefault,
  preOrderEligible,
}: {
  value: FulfilmentChoiceValue | null;
  standDefault: FulfilmentChoiceValue;
  preOrderEligible: boolean;
}) {
  return (
    <DashFormSection title="Pickup & delivery">
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
          Delivery asks the customer for their address at checkout and is paid by card.{" "}
          <Link href="/dashboard/collections" className="underline">
            Change the business setting
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
