"use client";

import { useSyncExternalStore } from "react";

function subscribe(onTick: () => void) {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
}

const nowSeconds = () => Math.floor(Date.now() / 1000);
const serverSnapshot = () => null;

/** The current time in whole seconds, ticking each second; null on the server and during hydration. */
export function useNowSeconds(): number | null {
  return useSyncExternalStore(subscribe, nowSeconds, serverSnapshot);
}
