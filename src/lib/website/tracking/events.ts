export type TrackItem = {
  id: string;
  name: string;
  /** Unit price in cents. */
  priceCents: number;
  quantity: number;
};

type Commerce = { items: TrackItem[]; valueCents: number; currency: string };

export type StorefrontEvent =
  | ({ name: "view_item" } & Commerce)
  | ({ name: "add_to_cart" } & Commerce)
  | ({ name: "begin_checkout" } & Commerce)
  | ({ name: "purchase"; orderNumber: string } & Commerce);

export const STOREFRONT_EVENT = "vendl:track";

type EventQueueWindow = Window & { __vendlEvents?: StorefrontEvent[]; __vendlTagsReady?: boolean };

/**
 * Hands an event to the website tags runtime. Events fired before the runtime mounts
 * are queued. No-op in effect where no runtime is mounted (vendl.app).
 */
export function emitStorefrontEvent(event: StorefrontEvent) {
  if (typeof window === "undefined") return;
  const w = window as EventQueueWindow;
  if (!w.__vendlTagsReady) {
    (w.__vendlEvents ??= []).push(event);
    return;
  }
  window.dispatchEvent(new CustomEvent<StorefrontEvent>(STOREFRONT_EVENT, { detail: event }));
}

/** Called once by the runtime when it starts listening; returns events queued before that. */
export function takeQueuedStorefrontEvents(): StorefrontEvent[] {
  const w = window as EventQueueWindow;
  const queued = w.__vendlEvents ?? [];
  w.__vendlEvents = [];
  w.__vendlTagsReady = true;
  return queued;
}

export function releaseStorefrontEvents() {
  (window as EventQueueWindow).__vendlTagsReady = false;
}

/** Shared by browser and server so Meta/TikTok count each sale once. */
export function purchaseEventId(orderNumber: string): string {
  return `purchase_${orderNumber}`;
}

export const centsToValue = (cents: number) => Math.round(cents) / 100;
