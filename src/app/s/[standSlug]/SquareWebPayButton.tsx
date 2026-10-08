"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { SquareCheckoutCartInput } from "@/lib/square/checkout-create-order";
import PaymentIconRow from "@/components/PaymentIconRow";
import PoweredByRail from "@/components/PoweredByRail";
import { SQUARE_CHECKOUT_BRANDS } from "@/lib/payment-brand-assets";
import {
  continueSquareCardPay,
  type SquarePaySession,
} from "./continue-square-card-pay";
import { getSquarePayConfig } from "./square-checkout-actions";
import SquareWalletButtons from "./SquareWalletButtons";
import { useSquareSdk, type SquareCard, type SquarePayments } from "./use-square-sdk";

type Props = SquareCheckoutCartInput & {
  /** Deposit carts save the card for the balance, so wallets are hidden. */
  depositMode?: boolean;
  amountCents: number;
  currency: string;
  disabled?: boolean;
  onError: (message: string) => void;
  onSuccess: (orderNumber: string) => void;
};

export default function SquareWebPayButton(props: Props) {
  const {
    standSlug,
    depositMode = false,
    amountCents,
    currency,
    disabled,
    onError,
    onSuccess,
  } = props;
  const [pending, start] = useTransition();
  const ready = useSquareSdk(onError);
  const [payments, setPayments] = useState<SquarePayments | null>(null);
  const [countryCode, setCountryCode] = useState("AU");
  const [session, setSession] = useState<SquarePaySession | null>(null);
  const cardRef = useRef<SquareCard | null>(null);

  useEffect(() => {
    if (!ready || !window.Square) return;
    let cancelled = false;
    void (async () => {
      const config = await getSquarePayConfig(standSlug);
      if (cancelled) return;
      if ("error" in config) {
        if (config.error) onError(config.error);
        return;
      }
      try {
        const instance = await window.Square!.payments(
          config.applicationId,
          config.locationId,
        );
        const card = await instance.card();
        await card.attach("#square-card-container");
        if (cancelled) return;
        cardRef.current = card;
        setPayments(instance);
        setCountryCode(config.countryCode);
      } catch {
        if (!cancelled) onError("Could not initialize the card form.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, standSlug, onError]);

  return (
    <div className="space-y-3 rounded-[var(--radius)] border-2 border-[var(--field)] bg-[var(--panel)] px-5 py-4">
      <div>
        <p className="text-xl font-semibold text-[var(--ink)]">
          Pay with credit card
        </p>
        <p className="mt-0.5 text-base text-[var(--muted)]">
          {depositMode
            ? "Your card is saved securely with Square for the balance"
            : "Card, Apple Pay, or Google Pay when available"}
        </p>
        <div className="mt-3 flex w-full justify-center rounded-[var(--radius)] bg-[var(--wash)] px-3 py-3">
          <PaymentIconRow
            brands={SQUARE_CHECKOUT_BRANDS}
            className="w-full justify-center gap-2.5"
            size="lg"
          />
        </div>
      </div>
      {payments && !depositMode ? (
        <SquareWalletButtons
          {...props}
          payments={payments}
          countryCode={countryCode}
          disabled={disabled || pending}
        />
      ) : null}
      <div id="square-card-container" className="min-h-[56px]" />
      <button
        type="button"
        disabled={disabled || pending || !payments}
        className="w-full rounded-lg bg-[var(--leaf)] px-4 py-3 text-base font-semibold text-white disabled:opacity-50"
        onClick={() => {
          start(async () => {
            try {
              const result = await continueSquareCardPay({
                ...props,
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
        {pending
          ? "Processing…"
          : session
            ? depositMode
              ? "Pay deposit"
              : "Pay now"
            : depositMode
              ? "Pay deposit with card"
              : "Pay with card"}
      </button>
      <PoweredByRail rail="square" />
    </div>
  );
}
