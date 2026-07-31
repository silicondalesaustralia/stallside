"use client";

import { useMemo, useState } from "react";
import PlanFeatureBlock from "@/components/PlanFeatureBlock";
import { formatMoney } from "@/lib/money";
import {
  BILLING_CURRENCIES,
  cardPlanCents,
  isBillingCurrency,
  type BillingCurrency,
} from "@/lib/saas-pricing";
import { startProPlanCheckout } from "./actions";

type PriceRow = { currency: BillingCurrency };

export default function BillingPlanForms({
  billingCurrency,
  proPrices,
  showPro,
  proConfigured,
}: {
  billingCurrency: BillingCurrency;
  proPrices: PriceRow[];
  showPro: boolean;
  proConfigured: boolean;
  /** @deprecated ignored — Cash is free forever */
  cashPrices?: PriceRow[];
  cardPrices?: PriceRow[];
  showCash?: boolean;
  showCard?: boolean;
  cashConfigured?: boolean;
  cardConfigured?: boolean;
}) {
  const codes = useMemo(
    () =>
      proPrices.length
        ? proPrices.map((p) => p.currency)
        : [...BILLING_CURRENCIES],
    [proPrices],
  );

  const [currency, setCurrency] = useState<BillingCurrency>(() =>
    codes.includes(billingCurrency) ? billingCurrency : codes[0] ?? "AUD",
  );

  if (!showPro) return null;

  return (
    <div className="space-y-6">
      <form
        action={startProPlanCheckout}
        className="space-y-3 rounded-2xl border-2 border-[var(--leaf)] bg-[var(--panel)] p-4"
      >
        <p className="text-sm font-semibold text-[var(--leaf)]">Stallside Pro</p>
        <p className="font-receipt text-2xl font-semibold text-[var(--marigold)]">
          From {formatMoney(cardPlanCents(currency), currency)}
          <span className="text-sm font-normal text-[var(--muted)]"> /mo</span>
        </p>
        <PlanFeatureBlock plan="pro" currency={currency} />
        <div className="flex flex-wrap items-end gap-3 pt-1">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--ink)]">Currency</span>
            <select
              name="currency"
              value={currency}
              onChange={(event) => {
                const next = event.target.value;
                if (isBillingCurrency(next)) setCurrency(next);
              }}
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
            >
              {codes.map((code) => (
                <option key={code} value={code}>
                  {code} · {formatMoney(cardPlanCents(code), code)}/mo
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={!proConfigured}
            className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-50"
          >
            Upgrade to Pro
          </button>
        </div>
        {!proConfigured ? (
          <p className="text-sm text-red-700">
            Pro Price IDs are not set (STRIPE_PRICE_ID_PRO_* or STRIPE_PRICE_ID_CARD_*).
          </p>
        ) : null}
      </form>
    </div>
  );
}
