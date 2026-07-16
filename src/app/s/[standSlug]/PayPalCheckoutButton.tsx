"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { startPayPalCheckout } from "./paypal-checkout-actions";

type CartItem = { productId: string; quantity: number };

type PayPalButtonsApi = {
  FUNDING: { PAYPAL: string };
  Buttons: (config: {
    fundingSource?: string;
    style?: Record<string, string | number | boolean>;
    createOrder: () => Promise<string>;
    onApprove: (data: { orderID: string }) => Promise<void>;
    onCancel?: () => void;
    onError?: (err: unknown) => void;
  }) => { render: (selector: string) => Promise<void> };
};

declare global {
  interface Window {
    paypal?: PayPalButtonsApi;
  }
}

function buildSdkSrc(clientId: string, currency: string, sandbox?: boolean) {
  const src = new URL("https://www.paypal.com/sdk/js");
  src.searchParams.set("client-id", clientId.trim());
  src.searchParams.set("currency", currency.toUpperCase());
  src.searchParams.set("intent", "capture");
  src.searchParams.set("components", "buttons");
  if (sandbox) {
    src.searchParams.set("enable-funding", "paypal");
    src.searchParams.set("disable-funding", "card,credit,paylater,venmo");
  }
  return src.toString();
}

export default function PayPalCheckoutButton({
  clientId,
  currency,
  standSlug,
  items,
  sandbox,
  disabled,
  onError,
}: {
  clientId: string;
  merchantId: string;
  currency: string;
  standSlug: string;
  items: CartItem[];
  sandbox?: boolean;
  disabled?: boolean;
  onError: (message: string) => void;
}) {
  const hostId = useRef(`pp-${Math.random().toString(36).slice(2, 9)}`).current;
  const orderIdRef = useRef<string | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const [sdkReady, setSdkReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (window.paypal) {
      setSdkReady(true);
      return;
    }
    const start = Date.now();
    const id = window.setInterval(() => {
      if (window.paypal) {
        setSdkReady(true);
        window.clearInterval(id);
      } else if (Date.now() - start > 12_000) {
        window.clearInterval(id);
        setFallback(true);
      }
    }, 200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!sdkReady || !window.paypal || disabled) return;
    const el = document.getElementById(hostId);
    if (!el || el.childElementCount > 0) return;

    void window.paypal
      .Buttons({
        ...(sandbox ? { fundingSource: window.paypal.FUNDING.PAYPAL } : {}),
        style: {
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
          tagline: false,
          height: 55,
        },
        createOrder: async () => {
          const result = await startPayPalCheckout({
            standSlug,
            items: itemsRef.current,
          });
          if ("error" in result && result.error) {
            onErrorRef.current(result.error);
            throw new Error(result.error);
          }
          if (!("paypalOrderId" in result) || !result.paypalOrderId) {
            onErrorRef.current("Could not start PayPal checkout.");
            throw new Error("missing order");
          }
          orderIdRef.current = result.orderId ?? null;
          return result.paypalOrderId;
        },
        onApprove: async (data) => {
          const orderId = orderIdRef.current;
          if (!orderId) {
            onErrorRef.current("PayPal order missing after approval.");
            return;
          }
          window.location.href = `/checkout/success?order_id=${encodeURIComponent(orderId)}&paypal=1&token=${encodeURIComponent(data.orderID)}`;
        },
        onCancel: () => {
          const orderId = orderIdRef.current;
          if (orderId) {
            window.location.href = `/checkout/cancelled?order=${encodeURIComponent(orderId)}`;
          }
        },
        onError: () => onErrorRef.current("PayPal checkout failed. Try again."),
      })
      .render(`#${hostId}`)
      .catch(() => {
        setFallback(true);
        onErrorRef.current("Could not render PayPal — use Continue below.");
      });
  }, [sdkReady, disabled, hostId, standSlug, sandbox]);

  async function redirectCheckout() {
    setBusy(true);
    try {
      const result = await startPayPalCheckout({
        standSlug,
        items: itemsRef.current,
      });
      if ("error" in result && result.error) {
        onErrorRef.current(result.error);
        return;
      }
      if ("url" in result && result.url) {
        window.location.href = result.url;
        return;
      }
      onErrorRef.current("Could not start PayPal checkout.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={disabled ? "pointer-events-none opacity-50" : undefined}>
      <Script
        src={buildSdkSrc(clientId, currency, sandbox)}
        strategy="afterInteractive"
        onLoad={() => {
          if (window.paypal) setSdkReady(true);
        }}
        onReady={() => {
          if (window.paypal) setSdkReady(true);
        }}
        onError={() => setFallback(true)}
      />
      <div className="overflow-hidden rounded-[var(--radius)] [&_iframe]:rounded-[var(--radius)] [&_.paypal-buttons]:rounded-[var(--radius)] [&_.paypal-buttons-context-iframe]:rounded-[var(--radius)]">
        <div id={hostId} className="min-h-[55px] w-full" />
      </div>
      {!sdkReady && !fallback ? (
        <p className="text-center text-sm text-[var(--muted)]">Loading PayPal…</p>
      ) : null}
      {fallback ? (
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => void redirectCheckout()}
          className="mt-2 w-full rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-5 py-5 text-left text-xl font-semibold disabled:opacity-50"
        >
          {busy ? "Opening PayPal…" : "Continue with PayPal"}
        </button>
      ) : null}
    </div>
  );
}
