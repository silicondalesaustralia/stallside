"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { localTransferForCurrency } from "@/lib/local-transfer";
import { updateStandPayments } from "../stand-payment-actions";

export type StandPaymentOptionsProps = {
  standId: string;
  currency: string;
  localTransferAlias: string | null;
  localTransferMethodId: string | null;
  acceptCash: boolean;
  acceptLocalTransfer: boolean;
  acceptCard: boolean;
  acceptPayPal: boolean;
  cardReady: boolean;
  paypalReady: boolean;
  cardTier: boolean;
};

export default function StandPaymentOptions({
  standId,
  currency,
  localTransferAlias,
  localTransferMethodId,
  acceptCash,
  acceptLocalTransfer,
  acceptCard,
  acceptPayPal,
  cardReady,
  paypalReady,
  cardTier,
}: StandPaymentOptionsProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const method = localTransferForCurrency(currency);
  const initialAlias =
    method && localTransferMethodId === method.id
      ? (localTransferAlias ?? "")
      : "";
  const [alias, setAlias] = useState(initialAlias);
  const save = updateStandPayments.bind(null, standId);

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await save(formData);
        if (result && "error" in result && result.error) {
          setMessage(result.error);
          return;
        }
        setMessage("Payment options saved.");
        router.refresh();
      } catch (error) {
        console.error("Stand payments save failed", error);
        setMessage("Could not save payment options.");
      }
    });
  }

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
      <h2 className="text-lg font-semibold">Checkout payments</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Enable or disable what customers see at this stand. Currency: {currency}.
      </p>

      <form action={onSubmit} className="mt-4 flex flex-col gap-4">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="acceptCash"
            defaultChecked={acceptCash}
            className="mt-1 size-4"
          />
          <span>
            <span className="font-medium">Cash</span>
            <span className="mt-0.5 block text-[var(--muted)]">
              Customer confirms they paid cash at the stand.
            </span>
          </span>
        </label>

        {method ? (
          <div className="rounded-xl border border-[var(--line)] bg-[var(--wash)] p-4">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                name="acceptLocalTransfer"
                defaultChecked={acceptLocalTransfer}
                className="mt-1 size-4"
              />
              <span>
                <span className="font-medium">PayID</span>
                <span className="mt-0.5 block text-[var(--muted)]">
                  AUD only. Customer pays your PayID, then confirms.
                </span>
              </span>
            </label>
            <input type="hidden" name="localTransferMethodId" value={method.id} />
            <label className="mt-3 flex flex-col gap-2 text-sm">
              <span className="font-medium">{method.aliasLabel}</span>
              <input
                name="localTransferAlias"
                value={alias}
                onChange={(event) => setAlias(event.target.value)}
                placeholder={method.aliasPlaceholder}
                maxLength={120}
                className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
              />
              <span className="text-[var(--muted)]">{method.aliasHint}</span>
            </label>
          </div>
        ) : null}

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="acceptCard"
            defaultChecked={acceptCard}
            disabled={!cardTier || !cardReady}
            className="mt-1 size-4 disabled:opacity-50"
          />
          <span>
            <span className="font-medium">Card / Tap &amp; Go</span>
            <span className="mt-0.5 block text-[var(--muted)]">
              {!cardTier
                ? "Card plan feature."
                : cardReady
                  ? "All currencies. Requires Stripe connected."
                  : "Connect Stripe in Settings first."}
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="acceptPayPal"
            defaultChecked={acceptPayPal}
            disabled={!cardTier || !paypalReady}
            className="mt-1 size-4 disabled:opacity-50"
          />
          <span>
            <span className="font-medium">PayPal</span>
            <span className="mt-0.5 block text-[var(--muted)]">
              {!cardTier
                ? "Card plan feature."
                : paypalReady
                  ? "All currencies, including USD."
                  : "Connect PayPal in Settings and turn it on first."}
            </span>
          </span>
        </label>

        {cardTier ? (
          <p className="text-sm">
            <Link
              href="/dashboard/settings"
              className="font-medium text-[var(--leaf-dark)] underline"
            >
              Manage Stripe &amp; PayPal Connect
            </Link>
          </p>
        ) : null}

        {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-lg bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save payment options"}
        </button>
      </form>
    </section>
  );
}
