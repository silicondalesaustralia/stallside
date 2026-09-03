"use client";

import { useEffect, useRef, useState } from "react";
import PaymentBrandIcon from "@/components/PaymentBrandIcon";
import {
  loadPayPalButtonsSdk,
  paypalButtonsSdkSrc,
  paypalOffersVenmo,
} from "@/lib/paypal-sdk-url";
import { startPayPalCheckout } from "./paypal-checkout-actions";

type CartItem = {
  productId: string;
  quantity: number;
  choiceIds?: string[];
  asUpsell?: boolean;
};

type PayPalApi = {
  FUNDING: { PAYPAL: string; VENMO?: string };
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
    paypal?: PayPalApi;
  }
}

function paypalErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message.trim()) return err.message;
  if (typeof err === "string" && err.trim()) return err;
  return fallback;
}

export default function PayPalCheckoutButton({
  clientId,
  merchantId,
  currency,
  standSlug,
  items,
  customerChoiceAmountCents,
  disabled,
  sandbox = false,
  marketplace = false,
  onError,
}: {
  clientId: string;
  merchantId: string;
  currency: string;
  standSlug: string;
  items?: CartItem[];
  customerChoiceAmountCents?: number;
  sandbox?: boolean;
  disabled?: boolean;
  /** Marketplace Connect (non-USD): redirect to PayPal. USD uses SDK + Venmo. */
  marketplace?: boolean;
  onError: (message: string) => void;
}) {
  const hostId = useRef(`pp-${Math.random().toString(36).slice(2, 9)}`).current;
  const venmoHostId = useRef(
    `ppv-${Math.random().toString(36).slice(2, 9)}`,
  ).current;
  const orderIdRef = useRef<string | null>(null);
  const cancelTokenRef = useRef<string | null>(null);
  const approveUrlRef = useRef<string | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const amountRef = useRef(customerChoiceAmountCents);
  amountRef.current = customerChoiceAmountCents;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const showVenmo = paypalOffersVenmo(currency);
  /** AUD marketplace → redirect; USD → PayPal + Venmo SDK buttons. */
  const useRedirect = marketplace && !showVenmo;

  const [sdkReady, setSdkReady] = useState(false);
  const [fallback, setFallback] = useState(useRedirect);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (useRedirect || fallback) return;
    let cancelled = false;
    const src = paypalButtonsSdkSrc({ clientId, currency, merchantId, sandbox });
    void loadPayPalButtonsSdk(src)
      .then(() => {
        if (!cancelled && window.paypal) setSdkReady(true);
      })
      .catch(() => {
        if (!cancelled) setFallback(true);
      });
    const timeout = window.setTimeout(() => {
      if (!cancelled && !window.paypal) setFallback(true);
    }, 12_000);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [
    useRedirect,
    fallback,
    clientId,
    currency,
    merchantId,
    sandbox,
  ]);

  function applyCheckoutResult(result: Awaited<ReturnType<typeof startPayPalCheckout>>) {
    if ("error" in result && result.error) {
      onErrorRef.current(result.error);
      return null;
    }
    if ("url" in result && result.url) {
      approveUrlRef.current = result.url;
    }
    if (!("paypalOrderId" in result) || !result.paypalOrderId) {
      onErrorRef.current("Could not start PayPal checkout.");
      return null;
    }
    orderIdRef.current = result.orderId ?? null;
    cancelTokenRef.current =
      "cancelToken" in result ? (result.cancelToken ?? null) : null;
    return result.paypalOrderId;
  }

  async function beginCheckout() {
    setBusy(true);
    try {
      const result = await startPayPalCheckout(
        amountRef.current != null
          ? { standSlug, customerChoiceAmountCents: amountRef.current }
          : { standSlug, items: itemsRef.current ?? [] },
      );
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

  function sdkOnError(err: unknown, label: string) {
    console.error(`${label} SDK error`, err);
    if (approveUrlRef.current) {
      window.location.href = approveUrlRef.current;
      return;
    }
    onErrorRef.current(paypalErrorMessage(err, `${label} checkout failed. Try again.`));
  }

  useEffect(() => {
    if (useRedirect || fallback || !sdkReady || !window.paypal || disabled) return;

    async function createOrder() {
      const amount = amountRef.current;
      const result = await startPayPalCheckout(
        amount != null
          ? { standSlug, customerChoiceAmountCents: amount }
          : { standSlug, items: itemsRef.current ?? [] },
      );
      const paypalOrderId = applyCheckoutResult(result);
      if (!paypalOrderId) {
        throw new Error(
          "error" in result && result.error
            ? result.error
            : "Could not start PayPal checkout.",
        );
      }
      return paypalOrderId;
    }

    async function onApprove(data: { orderID: string }) {
      const orderId = orderIdRef.current;
      if (!orderId) {
        onErrorRef.current("PayPal order missing after approval.");
        return;
      }
      window.location.href = `/checkout/success?order_id=${encodeURIComponent(orderId)}&paypal=1&token=${encodeURIComponent(data.orderID)}`;
    }

    function onCancel() {
      const orderId = orderIdRef.current;
      const cancelToken = cancelTokenRef.current;
      if (orderId && cancelToken) {
        window.location.href = `/checkout/cancelled?order=${encodeURIComponent(orderId)}&token=${encodeURIComponent(cancelToken)}`;
      }
    }

    const style = {
      layout: "vertical" as const,
      shape: "rect" as const,
      tagline: false,
      height: 55,
    };
    const api = window.paypal!;
    const el = document.getElementById(hostId);
    if (el && el.childElementCount === 0) {
      void api
        .Buttons({
          fundingSource: api.FUNDING.PAYPAL,
          style: { ...style, color: "gold", label: "paypal" },
          createOrder,
          onApprove,
          onCancel,
          onError: (err) => sdkOnError(err, "PayPal"),
        })
        .render(`#${hostId}`)
        .catch(() => {
          setFallback(true);
          onErrorRef.current("Could not render PayPal - use Continue below.");
        });
    }

    if (showVenmo && api.FUNDING.VENMO) {
      const venmoEl = document.getElementById(venmoHostId);
      if (venmoEl && venmoEl.childElementCount === 0) {
        void api
          .Buttons({
            fundingSource: api.FUNDING.VENMO,
            style: { ...style, color: "blue", label: "pay" },
            createOrder,
            onApprove,
            onCancel,
            onError: (err) => sdkOnError(err, "Venmo"),
          })
          .render(`#${venmoHostId}`)
          .catch(() => {
            /* Venmo unavailable for this buyer/device */
          });
      }
    }
  }, [
    sdkReady,
    disabled,
    hostId,
    venmoHostId,
    standSlug,
    showVenmo,
    useRedirect,
    fallback,
  ]);

  if (useRedirect || fallback) {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => void beginCheckout()}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-5 py-5 text-xl font-semibold disabled:opacity-50"
        >
          <PaymentBrandIcon brand="paypal" className="size-7" />
          {busy ? "Opening PayPal…" : "Pay with PayPal"}
        </button>
        {showVenmo ? (
          <p className="text-center text-sm text-[var(--muted)]">
            Venmo appears on the PayPal button above when your device and account
            support it (US buyers).
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={disabled ? "pointer-events-none opacity-50" : undefined}>
      <div className="flex flex-col gap-2">
        <div className="overflow-hidden rounded-[var(--radius)] [&_iframe]:rounded-[var(--radius)] [&_.paypal-buttons]:rounded-[var(--radius)] [&_.paypal-buttons-context-iframe]:rounded-[var(--radius)]">
          <div id={hostId} className="min-h-[55px] w-full" />
        </div>
        {showVenmo ? (
          <div className="overflow-hidden rounded-[var(--radius)] [&_iframe]:rounded-[var(--radius)] [&_.paypal-buttons]:rounded-[var(--radius)] [&_.paypal-buttons-context-iframe]:rounded-[var(--radius)]">
            <div id={venmoHostId} className="min-h-[55px] w-full" />
          </div>
        ) : null}
      </div>
      {!sdkReady ? (
        <p className="text-center text-sm text-[var(--muted)]">Loading PayPal…</p>
      ) : null}
    </div>
  );
}
