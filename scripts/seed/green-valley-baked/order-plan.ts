import { at, pick, rng, weekStart } from "./context";
import type { Catalogue, ProductRef } from "./catalogue";
import type { CustomerRef } from "./customers";
import { WEEKS } from "./production";

export type Channel = "subscription" | "membership" | "preorder" | "stall" | "online";
export type DraftLine = { product: ProductRef; quantity: number; unitCents?: number };
export type DraftOrder = {
  channel: Channel;
  createdAt: Date;
  collectionAt: Date | null;
  customer: CustomerRef | null;
  lines: DraftLine[];
  method: "CARD" | "CASH" | "LOCAL_TRANSFER";
  status: "COLLECTED" | "READY" | "ORDERED" | "CANCELLED" | null;
  subscriberEmail?: string;
  discount?: boolean;
};

/** Six past weeks of Friday collections and Saturday stall sales, plus this Friday's open pre-orders. */
export function planOrders(cat: Catalogue, customers: CustomerRef[]): DraftOrder[] {
  const rand = rng(20261026);
  const orders: DraftOrder[] = [];
  const shoppers = customers.slice(4);
  for (let w = 0; w <= WEEKS; w++) {
    const monday = weekStart(WEEKS - w);
    const current = w === WEEKS;
    const friday = at(monday, 4, 9);
    const doneStatus = (i: number) => (w === WEEKS - 1 && i < 2 ? "READY" : "COLLECTED");

    if (!current) {
      const subs = customers.slice(0, 4).concat(w < 5 ? [customers[11]] : [], w < 3 ? [customers[12]] : []);
      for (const c of subs) {
        orders.push({ channel: "subscription", createdAt: at(monday, 4, 6), collectionAt: friday, customer: c,
          lines: [{ product: cat.focaccia, quantity: 1, unitCents: 1000 }], method: "CARD", status: "COLLECTED", subscriberEmail: c.email });
      }
      for (const [i, c] of customers.slice(8, 11).entries()) {
        if (w < 1 + i) continue;
        orders.push({ channel: "membership", createdAt: at(monday, 4, 6, 5), collectionAt: friday, customer: c,
          lines: [{ product: cat.focaccia, quantity: 1, unitCents: 950 }], method: "CARD", status: doneStatus(i), subscriberEmail: c.email });
      }
    }

    const preCount = current ? 5 : 5 + Math.floor(rand() * 2);
    for (let i = 0; i < preCount; i++) {
      const loaves = 1 + Math.floor(rand() * 2);
      const lines: DraftLine[] = [{ product: cat.focaccia, quantity: loaves }];
      if (rand() < 0.7) lines.push({ product: cat.cookies, quantity: 1 });
      const day = current ? Math.min(i % 2, 0) : i % 3;
      orders.push({ channel: "preorder", createdAt: at(monday, day, 9 + i * 2, 10 + i * 7), collectionAt: friday,
        customer: pick(rand, shoppers), lines, method: rand() < 0.7 ? "CARD" : "LOCAL_TRANSFER",
        status: current ? "ORDERED" : doneStatus(i), discount: !current && i === 1 && w % 2 === 0 });
    }
    if (current) continue;

    const stallCount = 5 + Math.floor(rand() * 3);
    for (let i = 0; i < stallCount; i++) {
      const lines: DraftLine[] = [];
      if (rand() < 0.8) lines.push({ product: cat.focaccia, quantity: 1 + Math.floor(rand() * 2) });
      if (lines.length === 0 || rand() < 0.7) lines.push({ product: cat.cookies, quantity: 1 });
      orders.push({ channel: "stall", createdAt: at(monday, 5, 8 + i, 5 + i * 6), collectionAt: null,
        customer: rand() < 0.3 ? pick(rand, shoppers) : null, lines, method: rand() < 0.75 ? "CASH" : "LOCAL_TRANSFER",
        status: null });
    }
    for (let i = 0; i < 2; i++) {
      orders.push({ channel: "online", createdAt: at(monday, 1 + i * 2, 19, 20), collectionAt: null,
        customer: pick(rand, shoppers), lines: [{ product: cat.focaccia, quantity: 1 + i }, { product: cat.cookies, quantity: 1 }],
        method: "LOCAL_TRANSFER", status: w === 3 && i === 0 ? "CANCELLED" : "COLLECTED" });
    }
  }
  return orders.filter((o) => o.createdAt.getTime() < Date.now());
}
