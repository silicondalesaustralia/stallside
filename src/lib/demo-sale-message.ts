export const DEMO_SALE_MESSAGE = "stallside:demo-sale";

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

/** Tell a parent /demo phone frame that a sale completed (iframe checkout). */
export function notifyDemoParentSale(
  payload: Omit<DemoSalePayload, "type">,
): void {
  if (typeof window === "undefined") return;
  if (window.parent === window) return;
  try {
    window.parent.postMessage(
      { type: DEMO_SALE_MESSAGE, ...payload } satisfies DemoSalePayload,
      window.location.origin,
    );
  } catch (error) {
    console.error("Demo sale postMessage failed", error);
  }
}
