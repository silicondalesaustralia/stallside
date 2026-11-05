"use client";

import { useMakersLpCurrency } from "@/components/lp/makers/makers-lp-currency";
import { formatLpPrice, lpProMonthly } from "@/lib/makers-lp-price";

/** Monthly plan price in the visitor's selected currency. */
export default function MakersLpPlanPrice({ plan }: { plan: "free" | "pro" }) {
  const { currency } = useMakersLpCurrency();
  return <>{plan === "pro" ? lpProMonthly(currency) : formatLpPrice(0, currency)}</>;
}
