/** Client cart lines keyed by stand slug (localStorage). Supports option choices. */

import { cartLineKey } from "@/lib/product-options";

const PREFIX = "stallside-cart:";

export type CartLine = {
  productId: string;
  quantity: number;
  /** One choice id per option group, in group sort order. */
  choiceIds: string[];
  /** Priced via stand upsell override (ignore tiers). */
  asUpsell?: boolean;
};

/** @deprecated Prefer CartLine[]; kept for gradual migration. */
export type CartQtyMap = Record<string, number>;

type Listener = () => void;
const listeners = new Set<Listener>();
let cartEpoch = 0;

function key(standSlug: string) {
  return `${PREFIX}${standSlug}`;
}

function notifyCartChange() {
  cartEpoch += 1;
  for (const listener of listeners) listener();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("stallside-cart"));
  }
}

export function subscribeStandCart(onStoreChange: Listener): () => void {
  listeners.add(onStoreChange);
  if (typeof window === "undefined") {
    return () => {
      listeners.delete(onStoreChange);
    };
  }
  const onStorage = (e: StorageEvent) => {
    if (e.key?.startsWith(PREFIX)) onStoreChange();
  };
  const onCustom = () => onStoreChange();
  window.addEventListener("storage", onStorage);
  window.addEventListener("stallside-cart", onCustom);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("stallside-cart", onCustom);
  };
}

export function getStandCartEpoch(): number {
  return cartEpoch;
}

function normalizeLines(raw: unknown): CartLine[] {
  if (!raw || typeof raw !== "object") return [];
  const obj = raw as { v?: number; lines?: unknown };
  if (Array.isArray(obj.lines)) {
    const out: CartLine[] = [];
    for (const line of obj.lines) {
      if (!line || typeof line !== "object") continue;
      const productId = String((line as CartLine).productId ?? "");
      const quantity = Number((line as CartLine).quantity);
      const choiceIds = Array.isArray((line as CartLine).choiceIds)
        ? (line as CartLine).choiceIds.map(String)
        : [];
      if (!productId || !Number.isInteger(quantity) || quantity <= 0) continue;
      out.push({
        productId,
        quantity,
        choiceIds,
        asUpsell: Boolean((line as CartLine).asUpsell),
      });
    }
    return out;
  }
  // Legacy map: { productId: qty }
  const out: CartLine[] = [];
  for (const [id, qty] of Object.entries(raw as Record<string, unknown>)) {
    if (id === "v" || id === "lines") continue;
    const n = Number(qty);
    if (Number.isInteger(n) && n > 0) {
      out.push({ productId: id, quantity: n, choiceIds: [] });
    }
  }
  return out;
}

export function readStandCartLines(standSlug: string): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key(standSlug));
    if (!raw) return [];
    return normalizeLines(JSON.parse(raw) as unknown);
  } catch {
    return [];
  }
}

/** Legacy helper: productId → total qty across all option combos. */
export function readStandCart(standSlug: string): CartQtyMap {
  const map: CartQtyMap = {};
  for (const line of readStandCartLines(standSlug)) {
    map[line.productId] = (map[line.productId] ?? 0) + line.quantity;
  }
  return map;
}

export function writeStandCartLines(standSlug: string, lines: CartLine[]) {
  if (typeof window === "undefined") return;
  const cleaned = lines.filter(
    (l) =>
      l.productId &&
      Number.isInteger(l.quantity) &&
      l.quantity > 0 &&
      Array.isArray(l.choiceIds),
  );
  window.localStorage.setItem(
    key(standSlug),
    JSON.stringify({ v: 2, lines: cleaned }),
  );
  notifyCartChange();
}

/** @deprecated Writes as lines with empty choiceIds. */
export function writeStandCart(standSlug: string, qty: CartQtyMap) {
  writeStandCartLines(
    standSlug,
    Object.entries(qty).map(([productId, quantity]) => ({
      productId,
      quantity,
      choiceIds: [],
    })),
  );
}

export function cartItemCount(linesOrMap: CartLine[] | CartQtyMap): number {
  if (Array.isArray(linesOrMap)) {
    return linesOrMap.reduce((s, l) => s + l.quantity, 0);
  }
  return Object.values(linesOrMap).reduce((s, n) => s + n, 0);
}

export function productQtyInCart(lines: CartLine[], productId: string): number {
  return lines
    .filter((l) => l.productId === productId)
    .reduce((s, l) => s + l.quantity, 0);
}

export function addToStandCart(
  standSlug: string,
  productId: string,
  delta: number,
  maxStock: number,
  choiceIds: string[] = [],
): CartLine[] {
  const lines = readStandCartLines(standSlug);
  const k = cartLineKey(productId, choiceIds);
  const idx = lines.findIndex(
    (l) => cartLineKey(l.productId, l.choiceIds) === k,
  );
  const otherQty = productQtyInCart(lines, productId) - (idx >= 0 ? lines[idx].quantity : 0);
  const currentLineQty = idx >= 0 ? lines[idx].quantity : 0;
  const nextLineQty = Math.max(
    0,
    Math.min(maxStock - otherQty, currentLineQty + delta),
  );
  const next = [...lines];
  if (nextLineQty <= 0) {
    if (idx >= 0) next.splice(idx, 1);
  } else if (idx >= 0) {
    next[idx] = { ...next[idx], quantity: nextLineQty };
  } else {
    next.push({ productId, quantity: nextLineQty, choiceIds: [...choiceIds] });
  }
  writeStandCartLines(standSlug, next);
  return next;
}

export function setCartLineQuantity(
  standSlug: string,
  productId: string,
  choiceIds: string[],
  quantity: number,
  maxStock: number,
): CartLine[] {
  const lines = readStandCartLines(standSlug);
  const k = cartLineKey(productId, choiceIds);
  const idx = lines.findIndex(
    (l) => cartLineKey(l.productId, l.choiceIds) === k,
  );
  const otherQty =
    productQtyInCart(lines, productId) - (idx >= 0 ? lines[idx].quantity : 0);
  const nextQty = Math.max(0, Math.min(maxStock - otherQty, quantity));
  const next = [...lines];
  if (nextQty <= 0) {
    if (idx >= 0) next.splice(idx, 1);
  } else if (idx >= 0) {
    next[idx] = { ...next[idx], quantity: nextQty };
  } else {
    next.push({ productId, quantity: nextQty, choiceIds: [...choiceIds] });
  }
  writeStandCartLines(standSlug, next);
  return next;
}

export function pruneStandCart(
  standSlug: string,
  validProductIds: Iterable<string>,
): CartLine[] {
  const valid = new Set(validProductIds);
  const current = readStandCartLines(standSlug);
  const pruned = current.filter((l) => valid.has(l.productId));
  if (pruned.length !== current.length) {
    writeStandCartLines(standSlug, pruned);
  }
  return pruned;
}
