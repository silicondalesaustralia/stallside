import { centsToValue, purchaseEventId, type StorefrontEvent } from "./events";
import type { TrackingIds } from "./types";

type Call = (...args: unknown[]) => void;

type TagWindow = Window & {
  dataLayer?: unknown[];
  gtag?: Call;
  fbq?: Call;
  ttq?: { track: Call; page: Call };
  pintrk?: Call;
  uetq?: { push: Call };
  snaptr?: Call;
  rdt?: Call;
};

const tagWindow = () => window as TagWindow;

const META_NAMES = { view_item: "ViewContent", add_to_cart: "AddToCart", begin_checkout: "InitiateCheckout", purchase: "Purchase" } as const;
const TIKTOK_NAMES = { view_item: "ViewContent", add_to_cart: "AddToCart", begin_checkout: "InitiateCheckout", purchase: "CompletePayment" } as const;
const PINTEREST_NAMES = { view_item: "pagevisit", add_to_cart: "addtocart", begin_checkout: null, purchase: "checkout" } as const;
const SNAP_NAMES = { view_item: "VIEW_CONTENT", add_to_cart: "ADD_CART", begin_checkout: "START_CHECKOUT", purchase: "PURCHASE" } as const;
const REDDIT_NAMES = { view_item: "ViewContent", add_to_cart: "AddToCart", begin_checkout: null, purchase: "Purchase" } as const;

function googleItems(event: StorefrontEvent) {
  return event.items.map((i) => ({ item_id: i.id, item_name: i.name, price: centsToValue(i.priceCents), quantity: i.quantity }));
}

function sendGoogle(ids: TrackingIds, event: StorefrontEvent) {
  const w = tagWindow();
  const value = centsToValue(event.valueCents);
  const transaction = event.name === "purchase" ? { transaction_id: event.orderNumber } : {};
  const params = { currency: event.currency, value, items: googleItems(event), ...transaction };
  if (ids.gtmId && w.dataLayer) {
    w.dataLayer.push({ ecommerce: null });
    w.dataLayer.push({ event: event.name, ecommerce: params });
  }
  if (!w.gtag) return;
  if (ids.ga4Id) w.gtag("event", event.name, { ...params, send_to: ids.ga4Id });
  if (event.name === "purchase" && ids.googleAdsId && ids.googleAdsPurchaseLabel) {
    w.gtag("event", "conversion", { send_to: `${ids.googleAdsId}/${ids.googleAdsPurchaseLabel}`, value, currency: event.currency, ...transaction });
  }
}

function sendPixels(ids: TrackingIds, event: StorefrontEvent) {
  const w = tagWindow();
  const value = centsToValue(event.valueCents);
  const eventId = event.name === "purchase" ? purchaseEventId(event.orderNumber) : undefined;
  const quantity = event.items.reduce((sum, i) => sum + i.quantity, 0);
  if (ids.metaPixelId && w.fbq) {
    w.fbq("trackSingle", ids.metaPixelId, META_NAMES[event.name], {
      content_ids: event.items.map((i) => i.id),
      contents: event.items.map((i) => ({ id: i.id, quantity: i.quantity })),
      content_type: "product", value, currency: event.currency, num_items: quantity,
    }, eventId ? { eventID: eventId } : undefined);
  }
  if (ids.tiktokPixelId && w.ttq) {
    w.ttq.track(TIKTOK_NAMES[event.name], {
      contents: event.items.map((i) => ({ content_id: i.id, content_name: i.name, quantity: i.quantity, price: centsToValue(i.priceCents) })),
      content_type: "product", value, currency: event.currency,
    }, eventId ? { event_id: eventId } : undefined);
  }
  const pinName = PINTEREST_NAMES[event.name];
  if (ids.pinterestTagId && w.pintrk && pinName) {
    w.pintrk("track", pinName, {
      value, currency: event.currency, order_quantity: quantity,
      ...(event.name === "purchase" ? { order_id: event.orderNumber, event_id: eventId } : {}),
      line_items: event.items.map((i) => ({ product_id: i.id, product_name: i.name, product_price: centsToValue(i.priceCents), product_quantity: i.quantity })),
    });
  }
  if (ids.microsoftUetId && w.uetq && event.name !== "view_item") {
    w.uetq.push("event", event.name, { revenue_value: value, currency: event.currency });
  }
  if (ids.snapPixelId && w.snaptr) {
    w.snaptr("track", SNAP_NAMES[event.name], {
      price: value, currency: event.currency, number_items: quantity,
      ...(event.name === "purchase" ? { transaction_id: event.orderNumber } : {}),
    });
  }
  const redditName = REDDIT_NAMES[event.name];
  if (ids.redditPixelId && w.rdt && redditName) {
    w.rdt("track", redditName, {
      value, currency: event.currency, itemCount: quantity,
      ...(event.name === "purchase" ? { transactionId: event.orderNumber } : {}),
    });
  }
}

/** Sends one storefront event to every loaded tag. Missing libraries are skipped. */
export function dispatchStorefrontEvent(ids: TrackingIds, event: StorefrontEvent, pixelsAllowed: boolean) {
  sendGoogle(ids, event);
  if (pixelsAllowed) sendPixels(ids, event);
}

/** Page views on client-side navigation (Google handles its own via history events). */
export function dispatchPageView(ids: TrackingIds) {
  const w = tagWindow();
  if (ids.metaPixelId && w.fbq) w.fbq("trackSingle", ids.metaPixelId, "PageView");
  if (ids.tiktokPixelId && w.ttq) w.ttq.page();
  if (ids.pinterestTagId && w.pintrk) w.pintrk("page");
  if (ids.snapPixelId && w.snaptr) w.snaptr("track", "PAGE_VIEW");
  if (ids.redditPixelId && w.rdt) w.rdt("track", "PageVisit");
}

/** Which tag libraries are present on the page (debug panel). */
export function loadedTagLibraries(): Record<string, boolean> {
  const w = window as unknown as Record<string, unknown>;
  return {
    gtag: typeof w.gtag === "function", dataLayer: Array.isArray(w.dataLayer), fbq: typeof w.fbq === "function",
    ttq: Boolean(w.ttq), pintrk: typeof w.pintrk === "function", uetq: Boolean(w.uetq), snaptr: typeof w.snaptr === "function",
    lintrk: typeof w.lintrk === "function", twq: typeof w.twq === "function", rdt: typeof w.rdt === "function",
    clarity: typeof w.clarity === "function", hj: typeof w.hj === "function",
  };
}
