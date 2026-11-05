"use client";

import { createContext, useContext } from "react";
import type { BillingCurrency } from "@/lib/saas-pricing";

export type MakersLpCurrencyValue = { currency: BillingCurrency };

export const MakersLpCurrencyContext = createContext<MakersLpCurrencyValue | null>(null);

export function useMakersLpCurrency(): MakersLpCurrencyValue {
  const value = useContext(MakersLpCurrencyContext);
  if (!value) throw new Error("useMakersLpCurrency must be used inside MakersLpCurrencyProvider");
  return value;
}
