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
import { getSquarePayConfig } from "./square-checkout-actions";
import SquareWalletButtons from "./SquareWalletButtons";
import { useSquareSdk, type SquarePayments } from "./use-square-sdk";

type Props = {
  standSlug: string;
  items?: CartItemInput[];
  customerChoiceAmountCents?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  couponCode?: string | null;
  amountCents: number;
  currency: string;
  disabled?: boolean;
  onError: (message: string) => void;
  onSuccess: (orderNumber: string) => void;
};

export default function SquareWebPayButton(props: Props) {
  const {
    standSlug,
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
  const cardRef = useRef<{
    tokenize: () => Promise<{ status: string; token?: string }>;
  } | null>(null);

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
          Card, Apple Pay, or Google Pay when available
        </p>
        <div className="mt-3 flex w-full justify-center rounded-[var(--radius)] bg-[var(--wash)] px-3 py-3">
          <PaymentIconRow
            brands={SQUARE_CHECKOUT_BRANDS}
            className="w-full justify-center gap-2.5"
            size="lg"
          />
        </div>
      </div>
      {payments ? (
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
        {pending ? "Processing…" : session ? "Pay now" : "Pay with card"}
      </button>
      <PoweredByRail rail="square" />
    </div>
  );
}
