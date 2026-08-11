"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { localTransferForCurrency } from "@/lib/local-transfer";
import { updateStandPayments } from "../stand-payment-actions";
import StandPaymentToggles from "./StandPaymentToggles";

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
  paypalConnectAvailable: boolean;
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
  paypalConnectAvailable,
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
  const save = updateStandPayments.bind(null, standId);
  const formKey = [
    acceptCash,
    acceptLocalTransfer,
    acceptCard,
    acceptPayPal,
    localTransferAlias,
  ].join(":");

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

      <form key={formKey} action={onSubmit} className="mt-4 flex flex-col gap-4">
        <StandPaymentToggles
          method={method}
          initialAlias={initialAlias}
          acceptCash={acceptCash}
          acceptLocalTransfer={acceptLocalTransfer}
          acceptCard={acceptCard}
          acceptPayPal={acceptPayPal}
          cardReady={cardReady}
          paypalReady={paypalReady}
          paypalConnectAvailable={paypalConnectAvailable}
          cardTier={cardTier}
        />
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
