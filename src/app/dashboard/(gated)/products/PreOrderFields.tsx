"use client";

import Link from "next/link";
import { useState } from "react";
import { toDateTimeLocalValue } from "@/lib/pre-order";

type Props = {
  stripeConnected: boolean;
  defaultIsPreOrder?: boolean;
  /** Always on - for pre-order pages (no toggle). */
  forceOn?: boolean;
  defaultOrderByAt?: Date | null;
  defaultCollectionAt?: Date | null;
  defaultCollectionNote?: string | null;
  defaultShowExactStock?: boolean;
  defaultDepositRequired?: boolean;
  defaultDepositPercent?: number | null;
  defaultHandoverMode?: "COLLECT" | "DELIVER";
  collectionNoun?: string;
};

export default function PreOrderFields({
  stripeConnected,
  defaultIsPreOrder = false,
  forceOn = false,
  defaultOrderByAt = null,
  defaultCollectionAt = null,
  defaultCollectionNote = null,
  defaultShowExactStock = false,
  defaultDepositRequired = false,
  defaultDepositPercent = 30,
  defaultHandoverMode = "COLLECT",
  collectionNoun = "Collection",
}: Props) {
  const [on, setOn] = useState(forceOn || defaultIsPreOrder);
  const [showExact, setShowExact] = useState(defaultShowExactStock);
  const [depositOn, setDepositOn] = useState(defaultDepositRequired);
  const [handover, setHandover] = useState<"COLLECT" | "DELIVER">(
    defaultHandoverMode,
  );
  const canEnable = forceOn || stripeConnected || on;

  return (
    <fieldset className="flex flex-col gap-3 rounded-lg border border-[var(--line)] p-4">
      {on || forceOn ? (
        <input type="hidden" name="isPreOrder" value="true" />
      ) : null}
      {!forceOn ? (
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
          Pre-order (pay ahead, {handover === "DELIVER" ? "deliver" : "collect"}{" "}
          later)
        </label>
      ) : (
        <p className="text-sm font-medium">
          Shared order window (all products on this page)
        </p>
      )}
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
      {on || forceOn ? (
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
            <span className="font-medium">
              {collectionNoun} (after orders close)
            </span>
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
            <span className="font-medium">Note (optional)</span>
            <input
              name="collectionNote"
              maxLength={200}
              placeholder={
                handover === "DELIVER"
                  ? "Delivered Sat morning"
                  : "Collect from the stall 8am-noon Sat"
              }
              defaultValue={defaultCollectionNote ?? ""}
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
            />
          </label>

          <div className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Handover</span>
            <input type="hidden" name="handoverMode" value={handover} />
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={handover === "COLLECT"}
                  onChange={() => setHandover("COLLECT")}
                  className="size-4 accent-[var(--leaf)]"
                />
                Collect at a place
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={handover === "DELIVER"}
                  onChange={() => setHandover("DELIVER")}
                  className="size-4 accent-[var(--leaf)]"
                />
                Deliver to an address
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Deposit required?</span>
            {depositOn ? (
              <input type="hidden" name="depositRequired" value="true" />
            ) : null}
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!depositOn}
                  onChange={() => setDepositOn(false)}
                  className="size-4 accent-[var(--leaf)]"
                />
                Pay in full
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={depositOn}
                  onChange={() => setDepositOn(true)}
                  className="size-4 accent-[var(--leaf)]"
                />
                Deposit
              </label>
              {depositOn ? (
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
          </div>

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
