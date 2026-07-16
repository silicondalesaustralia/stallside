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

export default function PayPalCheckoutButton({
  clientId,
  merchantId,
  currency,
  standSlug,
  items,
  disabled,
  onError,
}: {
  clientId: string;
  merchantId: string;
  currency: string;
  standSlug: string;
  items: CartItem[];
  disabled?: boolean;
  onError: (message: string) => void;
}) {
  const hostId = useRef(
    `paypal-btn-${Math.random().toString(36).slice(2, 10)}`,
  ).current;
  const stallsideOrderId = useRef<string | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const [sdkReady, setSdkReady] = useState(false);

  const sdkSrc = new URL("https://www.paypal.com/sdk/js");
  sdkSrc.searchParams.set("client-id", clientId);
  sdkSrc.searchParams.set("merchant-id", merchantId);
  sdkSrc.searchParams.set("currency", currency.toUpperCase());
  sdkSrc.searchParams.set("intent", "capture");
  sdkSrc.searchParams.set("components", "buttons");
  // Wallet login only — avoid guest "pay by card" taking over sandbox.
  sdkSrc.searchParams.set("enable-funding", "paypal");
  sdkSrc.searchParams.set("disable-funding", "card,credit,paylater,venmo");

  useEffect(() => {
    if (!sdkReady || !window.paypal || disabled) return;
    const el = document.getElementById(hostId);
    if (!el) return;
    el.innerHTML = "";

    void window.paypal
      .Buttons({
        fundingSource: window.paypal.FUNDING.PAYPAL,
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
            onError(result.error);
            throw new Error(result.error);
          }
          if (!("paypalOrderId" in result) || !result.paypalOrderId) {
            onError("Could not start PayPal checkout.");
            throw new Error("missing paypal order");
          }
          stallsideOrderId.current = result.orderId ?? null;
          return result.paypalOrderId;
        },
        onApprove: async (data) => {
          const orderId = stallsideOrderId.current;
          if (!orderId) {
            onError("PayPal order missing after approval.");
            return;
          }
          window.location.href = `/checkout/success?order_id=${encodeURIComponent(orderId)}&paypal=1&token=${encodeURIComponent(data.orderID)}`;
        },
        onCancel: () => {
          const orderId = stallsideOrderId.current;
          if (orderId) {
            window.location.href = `/checkout/cancelled?order=${encodeURIComponent(orderId)}`;
          }
        },
        onError: (err) => {
          console.error("PayPal Buttons error", err);
          onError("PayPal checkout failed. Try again.");
        },
      })
      .render(`#${hostId}`)
      .catch((err) => {
        console.error("PayPal Buttons render failed", err);
        onError("Could not load PayPal button.");
      });
  }, [sdkReady, disabled, hostId, standSlug, onError]);

  return (
    <div className={disabled ? "pointer-events-none opacity-50" : undefined}>
      <Script
        src={sdkSrc.toString()}
        strategy="afterInteractive"
        onReady={() => setSdkReady(true)}
        onError={() => onError("Could not load PayPal.")}
      />
      <div id={hostId} className="min-h-[55px] w-full" />
      {sdkReady ? null : (
        <p className="text-center text-sm text-[var(--muted)]">Loading PayPal…</p>
      )}
    </div>
  );
}
