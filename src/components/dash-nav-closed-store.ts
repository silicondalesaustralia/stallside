import { useSyncExternalStore } from "react";

const KEY = "dash-nav-closed-groups";
const listeners = new Set<() => void>();

function read(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** Sidebar group headings the owner has collapsed, remembered in this browser. */
export function useClosedNavGroups(): Set<string> {
  const raw = useSyncExternalStore(subscribe, read, () => "");
  return new Set(raw ? raw.split("|") : []);
}

export function toggleNavGroup(heading: string) {
  const closed = new Set(read() ? read().split("|") : []);
  if (closed.has(heading)) closed.delete(heading);
  else closed.add(heading);
  try {
    window.localStorage.setItem(KEY, [...closed].join("|"));
  } catch (error) {
    console.error("Could not save sidebar state", error);
  }
  for (const listener of listeners) listener();
}
