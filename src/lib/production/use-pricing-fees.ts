"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { FeeAssumptions } from "./price-model";

export type FeeInputs = { feePct: string; fixedFee: string };

const STORAGE_KEY = "vendl:pricing-fees";
const CHANGE_EVENT = "vendl:pricing-fees-change";
export const DEFAULT_FEE_INPUTS: FeeInputs = { feePct: "4.25", fixedFee: "0.30" };
const DEFAULT_RAW = JSON.stringify(DEFAULT_FEE_INPUTS);

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function readRaw(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? DEFAULT_RAW;
  } catch {
    return DEFAULT_RAW;
  }
}

function parse(raw: string): FeeInputs {
  try {
    const value: unknown = JSON.parse(raw);
    if (value && typeof value === "object" && "feePct" in value && "fixedFee" in value) {
      return { feePct: String(value.feePct), fixedFee: String(value.fixedFee) };
    }
  } catch {
    // fall through to defaults
  }
  return DEFAULT_FEE_INPUTS;
}

function toNumber(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function feesFromInputs(inputs: FeeInputs): FeeAssumptions {
  return { feePct: toNumber(inputs.feePct), fixedFeeCents: Math.round(toNumber(inputs.fixedFee) * 100) };
}

/** Fee assumptions shared by the pricing calculator and product editor, remembered on this device. */
export function usePricingFees(): [FeeInputs, (next: FeeInputs) => void] {
  const raw = useSyncExternalStore(subscribe, readRaw, () => DEFAULT_RAW);
  const setFees = useCallback((next: FeeInputs) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error("Could not save pricing fees", error);
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);
  return [parse(raw), setFees];
}
