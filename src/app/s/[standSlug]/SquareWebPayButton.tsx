"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  completeSquareCheckout,
  startSquareCheckout,
} from "./square-checkout-actions";
import type { CartItemInput } from "@/lib/checkout";
import { squareEnvironment } from "@/lib/square/public-env";

declare global {
  interface Window {
    Square?: {
      payments: (
        applicationId: string,
        locationId: string,
      ) => Promise<{
        card: () => Promise<{
          attach: (selector: string) => Promise<void>;
          tokenize: () => Promise<{
            status: string;
            token?: string;
            errors?: unknown;
          }>;
        }>;
      }>;
    };
  }
}

function squareSdkUrl(): string {
  return squareEnvironment() === "production"
    ? "https://web.squarecdn.com/v1/square.js"
    : "https://sandbox.web.squarecdn.com/v1/square.js";
}

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
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<{
    orderId: string;
    applicationId: string;
    locationId: string;
  } | null>(null);
  const cardRef = useRef<{ tokenize: () => Promise<{ status: string; token?: string }> } | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    const script = document.createElement("script");
    script.src = squareSdkUrl();
    script.async = true;
    script.onload = () => setReady(true);
    script.onerror = () => onError("Could not load Square payments.");
    document.body.appendChild(script);
  }, [onError]);

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
        if (!cancelled) onError("Could not initialize Square card form.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, session, onError]);

  return (
    <div className="space-y-3 rounded-[var(--radius)] border-2 border-[var(--field)] bg-[var(--panel)] px-5 py-4">
      <p className="text-xl font-semibold">Pay with Square</p>
      <div id="square-card-container" className="min-h-[56px]" />
      <button
        type="button"
        disabled={disabled || pending}
        className="w-full rounded-lg bg-[var(--leaf)] px-4 py-3 text-base font-semibold text-white disabled:opacity-50"
        onClick={() => {
          start(async () => {
            try {
              if (!session) {
                const started = await startSquareCheckout({
                  standSlug,
                  items,
                  customerChoiceAmountCents,
                  customerName,
                  customerEmail,
                  customerPhone,
                  couponCode,
                });
                if ("error" in started && started.error) {
                  onError(started.error);
                  return;
                }
                if (!("orderId" in started) || !started.orderId) {
                  onError("Could not start Square checkout.");
                  return;
                }
                setSession({
                  orderId: started.orderId,
                  applicationId: started.applicationId!,
                  locationId: started.locationId!,
                });
                return;
              }
              if (!cardRef.current) {
                onError("Card form is still loading.");
                return;
              }
              const result = await cardRef.current.tokenize();
              if (result.status !== "OK" || !result.token) {
                onError("Card was not accepted. Try again.");
                return;
              }
              const done = await completeSquareCheckout({
                orderId: session.orderId,
                sourceId: result.token,
              });
              if ("error" in done && done.error) {
                onError(done.error);
                return;
              }
              if ("orderNumber" in done && done.orderNumber) {
                onSuccess(done.orderNumber);
              }
            } catch {
              onError("Square checkout failed.");
            }
          });
        }}
      >
        {pending
          ? "Processing…"
          : session
            ? "Pay now"
            : "Continue to Square"}
      </button>
    </div>
  );
}
