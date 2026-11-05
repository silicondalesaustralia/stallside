"use client";

import { useMakersLpCurrency } from "@/components/lp/makers/makers-lp-currency";
import { lpCurrencySymbol } from "@/lib/makers-lp-price";
import { BILLING_CURRENCIES, isBillingCurrency } from "@/lib/saas-pricing";

export default function MakersLpCurrencySelect() {
  const { currency, setCurrency } = useMakersLpCurrency();
  return (
    <label className="mt-6 flex items-center gap-3 text-xs text-[var(--field)] md:mt-0">
      Show prices in
      <select
        value={currency}
        onChange={(e) => {
          if (isBillingCurrency(e.target.value)) setCurrency(e.target.value);
        }}
        className="min-h-11 rounded border border-[var(--line)] bg-transparent px-3.5 py-2 text-[var(--field)]"
      >
        {BILLING_CURRENCIES.map((code) => (
          <option key={code} value={code}>
            {code} ({lpCurrencySymbol(code)})
          </option>
        ))}
      </select>
    </label>
  );
}
