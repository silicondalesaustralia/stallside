/** Browser PayPal JS SDK script URL for Buttons (wallet only; no hosted card). */
export function paypalButtonsSdkSrc(input: {
  clientId: string;
  currency: string;
  merchantId: string;
  sandbox?: boolean;
}): string {
  const src = new URL("https://www.paypal.com/sdk/js");
  src.searchParams.set("client-id", input.clientId.trim());
  src.searchParams.set("currency", input.currency.toUpperCase());
  src.searchParams.set("intent", "capture");
  src.searchParams.set("components", "buttons");
  if (input.merchantId.trim()) {
    src.searchParams.set("merchant-id", input.merchantId.trim());
  }
  src.searchParams.set("disable-funding", "card,credit,paylater");
  if (input.currency.trim().toUpperCase() === "USD") {
    src.searchParams.set("enable-funding", "venmo");
    if (input.sandbox) {
      src.searchParams.set("buyer-country", "US");
    }
  }
  return src.toString();
}

export function paypalOffersVenmo(currency: string): boolean {
  return currency.trim().toUpperCase() === "USD";
}

type PayPalWindow = Window & {
  paypal?: unknown;
  __paypalSdkPromises?: Record<string, Promise<void>>;
};

/** Load PayPal JS SDK (React 19 blocks next/script in client components). */
export function loadPayPalButtonsSdk(src: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }
  const w = window as PayPalWindow;
  if (w.paypal) return Promise.resolve();

  w.__paypalSdkPromises ??= {};
  const pending = w.__paypalSdkPromises[src];
  if (pending) return pending;

  const existing = document.querySelector(`script[data-paypal-sdk="${src}"]`);
  if (existing) {
    w.__paypalSdkPromises[src] = new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("PayPal SDK failed to load")),
        { once: true },
      );
    });
    return w.__paypalSdkPromises[src];
  }

  w.__paypalSdkPromises[src] = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.paypalSdk = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("PayPal SDK failed to load"));
    document.head.appendChild(script);
  });

  return w.__paypalSdkPromises[src];
}
