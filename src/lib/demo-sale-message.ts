export const DEMO_SALE_MESSAGE = "stallside:demo-sale";
export const DEMO_SALE_CHANNEL = "stallside-demo";
export const DEMO_SALE_PENDING_KEY = "stallside-demo-sale-pending";

export type DemoSalePayload = {
  type: typeof DEMO_SALE_MESSAGE;
  standSlug: string;
  via: "cash" | "local_transfer" | "card";
  totalCents?: number;
  currency?: string;
  productSummary?: string;
};

export type DemoSalePending = Omit<DemoSalePayload, "type">;

export function isDemoSalePayload(data: unknown): data is DemoSalePayload {
  if (!data || typeof data !== "object") return false;
  const msg = data as Record<string, unknown>;
  return msg.type === DEMO_SALE_MESSAGE && typeof msg.standSlug === "string";
}

function isDemoSalePending(data: unknown): data is DemoSalePending {
  if (!data || typeof data !== "object") return false;
  const msg = data as Record<string, unknown>;
  return typeof msg.standSlug === "string";
}

export function storePendingDemoSale(payload: DemoSalePending): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(DEMO_SALE_PENDING_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error("storePendingDemoSale failed", error);
  }
}

/** Read and clear a sale saved before redirecting back to /demo. */
export function consumePendingDemoSale(): DemoSalePending | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DEMO_SALE_PENDING_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(DEMO_SALE_PENDING_KEY);
    const parsed: unknown = JSON.parse(raw);
    return isDemoSalePending(parsed) ? parsed : null;
  } catch (error) {
    console.error("consumePendingDemoSale failed", error);
    return null;
  }
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
