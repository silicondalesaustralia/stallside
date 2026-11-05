"use client";

import { useCallback, useMemo, useSyncExternalStore, type ReactNode } from "react";
import {
  MakersLpCurrencyContext,
  readSavedCurrency,
  saveCurrency,
  subscribeSavedCurrency,
} from "@/components/lp/makers/makers-lp-currency";
import { trackMakersLpEvent } from "@/lib/makers-lp";
import type { BillingCurrency } from "@/lib/saas-pricing";

type Props = { initial: BillingCurrency; children: ReactNode };

/** Visitor's chosen currency wins; otherwise the server's region guess. */
export default function MakersLpCurrencyProvider({ initial, children }: Props) {
  const saved = useSyncExternalStore(subscribeSavedCurrency, readSavedCurrency, () => null);
  const currency = saved ?? initial;

  const setCurrency = useCallback((next: BillingCurrency) => {
    saveCurrency(next);
    trackMakersLpEvent("lp_currency_change", { currency: next });
  }, []);

  const value = useMemo(() => ({ currency, setCurrency }), [currency, setCurrency]);
  return <MakersLpCurrencyContext.Provider value={value}>{children}</MakersLpCurrencyContext.Provider>;
}
