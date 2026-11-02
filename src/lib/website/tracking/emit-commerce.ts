import { emitStorefrontEvent, type TrackItem } from "./events";

type ProductRef = { id: string; name: string };
type CartLineRef = { product: ProductRef; quantity: number; lineTotalCents: number };

export function productTrackItem(product: ProductRef, unitCents: number, quantity: number): TrackItem {
  return { id: product.id, name: product.name, priceCents: unitCents, quantity };
}

export function cartTrackItems(lines: CartLineRef[]): TrackItem[] {
  return lines.map((l) => ({
    id: l.product.id,
    name: l.product.name,
    priceCents: l.quantity > 0 ? Math.round(l.lineTotalCents / l.quantity) : 0,
    quantity: l.quantity,
  }));
}

export function trackViewItem(product: ProductRef, unitCents: number, currency: string) {
  emitStorefrontEvent({ name: "view_item", items: [productTrackItem(product, unitCents, 1)], valueCents: unitCents, currency });
}

export function trackAddToCart(product: ProductRef, unitCents: number, quantity: number, currency: string) {
  if (quantity <= 0) return;
  emitStorefrontEvent({ name: "add_to_cart", items: [productTrackItem(product, unitCents, quantity)], valueCents: unitCents * quantity, currency });
}

export function trackBeginCheckout(lines: CartLineRef[], totalCents: number, currency: string) {
  emitStorefrontEvent({ name: "begin_checkout", items: cartTrackItems(lines), valueCents: totalCents, currency });
}

export function trackPurchase(orderNumber: string, lines: CartLineRef[], totalCents: number, currency: string) {
  emitStorefrontEvent({ name: "purchase", orderNumber, items: cartTrackItems(lines), valueCents: totalCents, currency });
}
