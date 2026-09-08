"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { buildSquarePaymentRequestOptions } from "@/lib/square/payment-request";
import {
  runSquareWalletPay,
  type SquareWalletPayProps,
} from "./run-square-wallet-pay";
import type { SquarePayments, SquareWalletMethod } from "./use-square-sdk";

type Props = SquareWalletPayProps & {
  payments: SquarePayments;
  countryCode: string;
  currency: string;
  amountCents: number;
  disabled?: boolean;
};

export default function SquareWalletButtons(props: Props) {
  const [applePay, setApplePay] = useState<SquareWalletMethod | null>(null);
  const [showGoogle, setShowGoogle] = useState(false);
  const googlePayRef = useRef<SquareWalletMethod | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;
  const [pending, start] = useTransition();

  useEffect(() => {
    if (props.amountCents <= 0) return;
    let cancelled = false;
    const ac = new AbortController();
    const opts = buildSquarePaymentRequestOptions({
      countryCode: props.countryCode,
      currencyCode: props.currency,
      amountCents: props.amountCents,
    });

    void (async () => {
      try {
        const apple = await props.payments.applePay(
          props.payments.paymentRequest(opts),
        );
        if (!cancelled) setApplePay(apple);
      } catch {
        if (!cancelled) setApplePay(null);
      }

      const host = document.getElementById("square-google-pay");
      try {
        const google = await props.payments.googlePay(
          props.payments.paymentRequest(opts),
        );
        if (cancelled) return;
        googlePayRef.current = google;
        if (google.attach && host) {
          await google.attach("#square-google-pay");
          host.addEventListener(
            "click",
            (event) => {
              event.preventDefault();
              const method = googlePayRef.current;
              if (method) void runSquareWalletPay(method, propsRef.current, start);
            },
            { signal: ac.signal },
          );
        }
        if (!cancelled) setShowGoogle(true);
      } catch {
        googlePayRef.current = null;
        if (!cancelled) setShowGoogle(false);
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
      setApplePay(null);
      setShowGoogle(false);
      googlePayRef.current = null;
      document.getElementById("square-google-pay")?.replaceChildren();
    };
  }, [
    props.payments,
    props.countryCode,
    props.currency,
    props.amountCents,
    start,
  ]);

  if (props.amountCents <= 0 || (!applePay && !showGoogle)) return null;

  return (
    <div className="flex flex-col gap-2">
      {applePay ? (
        <button
          type="button"
          disabled={props.disabled || pending}
          onClick={() => void runSquareWalletPay(applePay, props, start)}
          className="flex h-12 w-full items-center justify-center rounded-lg bg-black text-sm font-semibold text-white disabled:opacity-50"
        >
          Apple Pay
        </button>
      ) : null}
      <div
        id="square-google-pay"
        className={showGoogle ? "min-h-12 w-full" : "hidden"}
      />
      <p className="text-center text-xs text-[var(--muted)]">
        Wallets appear when available on your device
      </p>
    </div>
  );
}
