"use client";

import { useSyncExternalStore } from "react";
import { readStallVisit } from "@/lib/storefront/at-stall";

const subscribe = () => () => {};

/** True when this visit started from a QR poster placed at the stall. */
export function useAtStall(): boolean {
  return useSyncExternalStore(subscribe, readStallVisit, () => false);
}
