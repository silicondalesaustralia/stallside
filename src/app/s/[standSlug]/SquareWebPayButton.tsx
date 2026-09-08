"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { CartItemInput } from "@/lib/checkout";
import PaymentIconRow from "@/components/PaymentIconRow";
import PoweredByRail from "@/components/PoweredByRail";
import { SQUARE_CHECKOUT_BRANDS } from "@/lib/payment-brand-assets";
import {
  continueSquareCardPay,
  type SquarePaySession,
} from "./continue-square-card-pay";
import { useSquareSdk } from "./use-square-sdk";

export default function SquareWebPayButton({
  standSlug,
  items,
  customerChoiceAmountCents,
  customerName,
  customerEmail,
  customerPhone,
  couponCode,
  disabled,
  onError,
  onSuccess,
}: {
  standSlug: string;
  items?: CartItemInput[];
  customerChoiceAmountCents?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  couponCode?: string | null;
  disabled?: boolean;
  onError: (message: string) => void;
  onSuccess: (orderNumber: string) => void;
}) {
  const [pending, start] = useTransition();
  const ready = useSquareSdk(onError);
  const [session, setSession] = useState<SquarePaySession | null>(null);
  const cardRef = useRef<{
    tokenize: () => Promise<{ status: string; token?: string }>;
  } | null>(null);

  useEffect(() => {
    if (!ready || !session || !window.Square) return;
    let cancelled = false;
    void (async () => {
      try {
        const payments = await window.Square!.payments(
          session.applicationId,
          session.locationId,
        );
        const card = await payments.card();
        await card.attach("#square-card-container");
        if (!cancelled) cardRef.current = card;
      } catch {
        if (!cancelled) onError("Could not initialize the card form.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, session, onError]);

  return (
    <div className="space-y-3 rounded-[var(--radius)] border-2 border-[var(--field)] bg-[var(--panel)] px-5 py-4">
      <div>
        <p className="text-xl font-semibold text-[var(--ink)]">
          Pay with credit card
        </p>
        <p className="mt-0.5 text-base text-[var(--muted)]">
          Enter your card details below
        </p>
        <div className="mt-3 flex w-full justify-center rounded-[var(--radius)] bg-[var(--wash)] px-3 py-3">
          <PaymentIconRow
            brands={SQUARE_CHECKOUT_BRANDS}
            className="w-full justify-center gap-2.5"
            size="lg"
          />
        </div>
      </div>
      <div id="square-card-container" className="min-h-[56px]" />
      <button
        type="button"
        disabled={disabled || pending}
        className="w-full rounded-lg bg-[var(--leaf)] px-4 py-3 text-base font-semibold text-white disabled:opacity-50"
        onClick={() => {
          start(async () => {
            try {
              const result = await continueSquareCardPay({
                standSlug,
                items,
                customerChoiceAmountCents,
                customerName,
                customerEmail,
                customerPhone,
                couponCode,
                session,
                card: cardRef.current,
              });
              if (result.kind === "error") {
                onError(result.message);
                return;
              }
              if (result.kind === "session") {
                setSession(result.session);
                return;
              }
              onSuccess(result.orderNumber);
            } catch {
              onError("Card payment failed.");
            }
          });
        }}
      >
        {pending ? "Processing…" : session ? "Pay now" : "Continue"}
      </button>
      <PoweredByRail rail="square" />
    </div>
  );
}
