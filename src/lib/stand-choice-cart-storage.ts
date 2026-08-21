/** Client Customer Choice amounts keyed by stand slug (localStorage). */

const PREFIX = "stallside-choice:";

type Listener = () => void;
const listeners = new Set<Listener>();
let cartEpoch = 0;

function key(standSlug: string) {
  return `${PREFIX}${standSlug}`;
}

function notify() {
  cartEpoch += 1;
  for (const listener of listeners) listener();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("stallside-choice"));
  }
}

export function subscribeChoiceCart(onStoreChange: Listener): () => void {
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
  window.addEventListener("stallside-choice", onCustom);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("stallside-choice", onCustom);
  };
}

export function getChoiceCartEpoch(): number {
  return cartEpoch;
}

function readRaw(standSlug: string): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key(standSlug));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { entries?: unknown };
    if (!Array.isArray(parsed.entries)) return [];
    return parsed.entries
      .map((n) => Number(n))
      .filter((n) => Number.isInteger(n) && n > 0);
  } catch {
    return [];
  }
}

function writeRaw(standSlug: string, entries: number[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    key(standSlug),
    JSON.stringify({ v: 1, entries }),
  );
  notify();
}

export function readChoiceEntries(standSlug: string): number[] {
  return readRaw(standSlug);
}

export function choiceTotalCents(standSlug: string): number {
  return readRaw(standSlug).reduce((sum, n) => sum + n, 0);
}

export function addChoiceEntry(standSlug: string, cents: number) {
  if (!Number.isInteger(cents) || cents <= 0) return;
  writeRaw(standSlug, [...readRaw(standSlug), cents]);
}

export function removeChoiceEntry(standSlug: string, index: number) {
  const entries = readRaw(standSlug);
  if (index < 0 || index >= entries.length) return;
  writeRaw(
    standSlug,
    entries.filter((_, i) => i !== index),
  );
}

export function clearChoiceCart(standSlug: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key(standSlug));
  notify();
}
