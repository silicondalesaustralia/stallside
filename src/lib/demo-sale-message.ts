export const DEMO_SALE_MESSAGE = "stallside:demo-sale";
export const DEMO_SALE_CHANNEL = "stallside-demo";

export type DemoSalePayload = {
  type: typeof DEMO_SALE_MESSAGE;
  standSlug: string;
  via: "cash" | "local_transfer" | "card";
  totalCents?: number;
  currency?: string;
  productSummary?: string;
};

export function isDemoSalePayload(data: unknown): data is DemoSalePayload {
  if (!data || typeof data !== "object") return false;
  const msg = data as Record<string, unknown>;
  return msg.type === DEMO_SALE_MESSAGE && typeof msg.standSlug === "string";
}

export function isEmbeddedCheckout(): boolean {
  return typeof window !== "undefined" && window.self !== window.top;
}

/** Notify /demo phone frame — postMessage when embedded, BroadcastChannel for card-in-new-tab. */
export function notifyDemoSale(payload: Omit<DemoSalePayload, "type">): void {
  if (typeof window === "undefined") return;

  const message = { type: DEMO_SALE_MESSAGE, ...payload } satisfies DemoSalePayload;

  if (window.parent !== window) {
    try {
      window.parent.postMessage(message, window.location.origin);
    } catch (error) {
      console.error("Demo sale postMessage failed", error);
    }
  }

  try {
    const channel = new BroadcastChannel(DEMO_SALE_CHANNEL);
    channel.postMessage(message);
    channel.close();
  } catch (error) {
    console.error("Demo sale broadcast failed", error);
  }
}

/** @deprecated use notifyDemoSale */
export function notifyDemoParentSale(
  payload: Omit<DemoSalePayload, "type">,
): void {
  notifyDemoSale(payload);
}
