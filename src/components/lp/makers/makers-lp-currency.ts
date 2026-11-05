"use client";

import { createContext, useContext } from "react";
import { BILLING_CURRENCY_STORAGE_KEY, isBillingCurrency, type BillingCurrency } from "@/lib/saas-pricing";

export type MakersLpCurrencyValue = {
  currency: BillingCurrency;
  setCurrency: (currency: BillingCurrency) => void;
};

export const MakersLpCurrencyContext = createContext<MakersLpCurrencyValue | null>(null);

export function useMakersLpCurrency(): MakersLpCurrencyValue {
  const value = useContext(MakersLpCurrencyContext);
  if (!value) throw new Error("useMakersLpCurrency must be used inside MakersLpCurrencyProvider");
  return value;
}

const listeners = new Set<() => void>();

export function subscribeSavedCurrency(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function readSavedCurrency(): BillingCurrency | null {
  try {
    const stored = localStorage.getItem(BILLING_CURRENCY_STORAGE_KEY);
    return stored && isBillingCurrency(stored) ? stored : null;
  } catch (error) {
    console.warn("Could not read saved billing currency", error);
    return null;
  }
}

export function saveCurrency(currency: BillingCurrency): void {
  try {
    localStorage.setItem(BILLING_CURRENCY_STORAGE_KEY, currency);
  } catch (error) {
    console.warn("Could not save billing currency", error);
  }
  listeners.forEach((listener) => listener());
}
