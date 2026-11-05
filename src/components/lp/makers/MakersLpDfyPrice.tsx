"use client";

import { useMakersLpCurrency } from "@/components/lp/makers/makers-lp-currency";
import { formatDfyBuildPrice } from "@/lib/website/dfy-build";

/** Done-for-you website build fee in the visitor's currency. */
export default function MakersLpDfyPrice() {
  const { currency } = useMakersLpCurrency();
  return <>{formatDfyBuildPrice(currency)}</>;
}
