"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toDateTimeLocalValue, type PreOrderPaymentTiming } from "@/lib/pre-order";
import { DEFAULT_TIMEZONE } from "@/lib/stand-timezone";
import PreOrderPaymentFields from "./PreOrderPaymentFields";

type Props = {
  stripeConnected: boolean;
  defaultIsPreOrder?: boolean;
  /** Always on - for pre-order pages (no toggle). */
  forceOn?: boolean;
  timeZone?: string;
  defaultOrderByAt?: Date | string | null;
  defaultCollectionAt?: Date | string | null;
  defaultCollectionNote?: string | null;
  defaultShowExactStock?: boolean;
  defaultPaymentOptions?: PreOrderPaymentTiming[];
  defaultDepositPercent?: number | null;
  defaultHandoverMode?: "COLLECT" | "DELIVER";
  collectionNoun?: string;
};

function asDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

/** Format in the stand timezone — not the server/browser local zone. */
function DateTimeLocalInput({
  name,
  defaultDate,
  timeZone,
  required,
  className,
}: {
  name: string;
  defaultDate: Date | string | null;
  timeZone: string;
  required?: boolean;
  className?: string;
}) {
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(
      defaultDate ? toDateTimeLocalValue(asDate(defaultDate), timeZone) : "",
    );
  }, [defaultDate, timeZone]);

  return (
    <input
      name={name}
      type="datetime-local"
      required={required}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className={className}
    />
  );
}

export default function PreOrderFields({
  stripeConnected,
  defaultIsPreOrder = false,
  forceOn = false,
  timeZone = DEFAULT_TIMEZONE,
  defaultOrderByAt = null,
  defaultCollectionAt = null,
  defaultCollectionNote = null,
  defaultShowExactStock = false,
  defaultPaymentOptions = ["PAY_UPFRONT"],
  defaultDepositPercent = 30,
  defaultHandoverMode = "COLLECT",
  collectionNoun = "Collection",
}: Props) {
  const [on, setOn] = useState(forceOn || defaultIsPreOrder);
  const [payOptions, setPayOptions] = useState<PreOrderPaymentTiming[]>(
    stripeConnected ? defaultPaymentOptions : ["PAY_AT_PICKUP"],
  );
  const [handover, setHandover] = useState<"COLLECT" | "DELIVER">(
    defaultHandoverMode,
  );
  const [showExact, setShowExact] = useState(defaultShowExactStock);
  const canEnable = forceOn || stripeConnected || on;
  const inputClass =
    "rounded-lg border border-[var(--line)] bg-white px-3 py-2.5";

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
          Without card payments, customers pay you at pickup.{" "}
          <Link
            href="/dashboard/payments"
            className="font-medium text-[var(--leaf-dark)] underline"
          >
            Connect Stripe or Square
          </Link>{" "}
          to take payment or a deposit when they order.
        </p>
      ) : null}
      {on || forceOn ? (
        <>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Orders close</span>
            <DateTimeLocalInput
              name="orderByAt"
              required
              timeZone={timeZone}
              defaultDate={defaultOrderByAt}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">
              {collectionNoun} (after orders close)
            </span>
            <DateTimeLocalInput
              name="collectionAt"
              required
              timeZone={timeZone}
              defaultDate={defaultCollectionAt}
              className={inputClass}
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
              className={inputClass}
            />
          </label>

          <div className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Handover</span>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="handoverMode"
                  value="COLLECT"
                  checked={handover === "COLLECT"}
                  onChange={() => setHandover("COLLECT")}
                  className="size-4 accent-[var(--leaf)]"
                />
                Collect at a place
              </label>
              <label
                className={`flex items-center gap-2 ${stripeConnected ? "" : "opacity-50"}`}
              >
                <input
                  type="radio"
                  name="handoverMode"
                  value="DELIVER"
                  checked={handover === "DELIVER"}
                  disabled={!stripeConnected}
                  onChange={() => {
                    setHandover("DELIVER");
                    const card = payOptions.filter((o) => o !== "PAY_AT_PICKUP");
                    setPayOptions(card.length ? card : ["PAY_UPFRONT"]);
                  }}
                  className="size-4 accent-[var(--leaf)]"
                />
                Deliver to an address
              </label>
            </div>
          </div>

          <PreOrderPaymentFields
            options={payOptions}
            onOptions={setPayOptions}
            cardReady={stripeConnected}
            deliver={handover === "DELIVER"}
            defaultDepositPercent={defaultDepositPercent}
            collectionNoun={collectionNoun}
          />

          <input
            type="hidden"
            name="preOrderShowExactStock"
            value={showExact ? "true" : "false"}
          />
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
