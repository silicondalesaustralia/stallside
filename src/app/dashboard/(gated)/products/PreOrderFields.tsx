"use client";

import Link from "next/link";
import { useState } from "react";
import { toDateTimeLocalValue } from "@/lib/pre-order";

type Props = {
  stripeConnected: boolean;
  defaultIsPreOrder?: boolean;
  defaultOrderByAt?: Date | null;
  defaultCollectionAt?: Date | null;
  defaultCollectionNote?: string | null;
  defaultShowExactStock?: boolean;
};

export default function PreOrderFields({
  stripeConnected,
  defaultIsPreOrder = false,
  defaultOrderByAt = null,
  defaultCollectionAt = null,
  defaultCollectionNote = null,
  defaultShowExactStock = false,
}: Props) {
  const [on, setOn] = useState(defaultIsPreOrder);
  const [showExact, setShowExact] = useState(defaultShowExactStock);
  const canEnable = stripeConnected || on;

  return (
    <fieldset className="flex flex-col gap-3 rounded-lg border border-[var(--line)] p-4">
      {/* Hidden flag — controlled checkboxes are unreliable in FormData/actions. */}
      {on ? <input type="hidden" name="isPreOrder" value="true" /> : null}
      <label
        className={`flex items-center gap-2 text-sm font-medium ${
          !canEnable ? "opacity-60" : ""
        }`}
      >
        <input
          type="checkbox"
          checked={on}
          disabled={!canEnable}
          onChange={(e) => {
            if (e.target.checked && !stripeConnected) return;
            setOn(e.target.checked);
          }}
          className="size-4 accent-[var(--leaf)]"
        />
        Pre-order (pay upfront, collect later)
      </label>
      {!stripeConnected ? (
        <p className="text-sm text-[var(--muted)]">
          Pre-orders need Stripe so customers can pay to reserve.{" "}
          <Link
            href="/dashboard/settings/stripe"
            className="font-medium text-[var(--leaf-dark)] underline"
          >
            Connect Stripe
          </Link>{" "}
          before enabling pre-orders.
        </p>
      ) : null}
      {on ? (
        <>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Orders close</span>
            <input
              name="orderByAt"
              type="datetime-local"
              required
              defaultValue={
                defaultOrderByAt ? toDateTimeLocalValue(defaultOrderByAt) : ""
              }
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Collection (after orders close)</span>
            <input
              name="collectionAt"
              type="datetime-local"
              required
              defaultValue={
                defaultCollectionAt
                  ? toDateTimeLocalValue(defaultCollectionAt)
                  : ""
              }
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Collection note (optional)</span>
            <input
              name="collectionNote"
              maxLength={200}
              placeholder="Collect from the stall 8am–noon Sat"
              defaultValue={defaultCollectionNote ?? ""}
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
            />
          </label>
          {showExact ? (
            <input type="hidden" name="preOrderShowExactStock" value="true" />
          ) : null}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showExact}
              onChange={(e) => setShowExact(e.target.checked)}
              className="size-4 accent-[var(--leaf)]"
            />
            Show exact slots left publicly
          </label>
          <p className="text-sm text-[var(--muted)]">
            Off shows Available / Low stock. On shows how many pre-orders are
            still open (e.g. “3 left”).
          </p>
        </>
      ) : null}
    </fieldset>
  );
}
