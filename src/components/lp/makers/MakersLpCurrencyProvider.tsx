"use client";

import { useMemo, type ReactNode } from "react";
import { MakersLpCurrencyContext } from "@/components/lp/makers/makers-lp-currency";
import type { BillingCurrency } from "@/lib/saas-pricing";

type Props = { initial: BillingCurrency; children: ReactNode };

/** Currency comes from the visitor's location (server-side); there is no picker. */
export default function MakersLpCurrencyProvider({ initial, children }: Props) {
  const value = useMemo(() => ({ currency: initial }), [initial]);
  return <MakersLpCurrencyContext.Provider value={value}>{children}</MakersLpCurrencyContext.Provider>;
}
