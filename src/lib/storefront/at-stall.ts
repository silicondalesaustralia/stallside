const STORAGE_KEY = "vendl:at-stall";

function urlHasStallFlag(): boolean {
  return new URLSearchParams(window.location.search).get("at") === "stall";
}

/** Remembers for this visit that the shopper scanned a poster at the stall. */
export function rememberStallVisit(): void {
  if (!urlHasStallFlag()) return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, "1");
  } catch (err) {
    console.warn("[at-stall] could not remember stall visit", err);
  }
}

export function readStallVisit(): boolean {
  if (urlHasStallFlag()) return true;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}
