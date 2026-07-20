"use client";

import { useMemo, useState } from "react";
import PlanFeatureBlock from "@/components/PlanFeatureBlock";
import { formatMoney } from "@/lib/money";
import {
  BILLING_CURRENCIES,
  cardPlanCents,
  cashPlanCents,
  isBillingCurrency,
  type BillingCurrency,
} from "@/lib/saas-pricing";
import { startCardPlanCheckout, startCashPlanCheckout } from "./actions";

type PriceRow = { currency: BillingCurrency };

export default function BillingPlanForms({
  billingCurrency,
  cashPrices,
  cardPrices,
  showCash,
  showCard,
  cashConfigured,
  cardConfigured,
}: {
  billingCurrency: BillingCurrency;
  cashPrices: PriceRow[];
  cardPrices: PriceRow[];
  showCash: boolean;
  showCard: boolean;
  cashConfigured: boolean;
  cardConfigured: boolean;
}) {
  const cashCodes = useMemo(
    () =>
      cashPrices.length
        ? cashPrices.map((p) => p.currency)
        : [...BILLING_CURRENCIES],
    [cashPrices],
  );
  const cardCodes = useMemo(
    () =>
      cardPrices.length
        ? cardPrices.map((p) => p.currency)
        : [...BILLING_CURRENCIES],
    [cardPrices],
  );

  const [cashCurrency, setCashCurrency] = useState<BillingCurrency>(() =>
    cashCodes.includes(billingCurrency) ? billingCurrency : cashCodes[0] ?? "AUD",
  );
  const [cardCurrency, setCardCurrency] = useState<BillingCurrency>(() =>
    cardCodes.includes(billingCurrency) ? billingCurrency : cardCodes[0] ?? "AUD",
  );

  return (
    <div className="space-y-6">
      {showCash ? (
        <form
          action={startCashPlanCheckout}
          className="space-y-3 rounded-2xl border-2 border-[var(--leaf)] bg-[var(--panel)] p-4"
        >
          <p className="text-sm font-semibold text-[var(--leaf)]">Cash plan</p>
          <p className="font-receipt text-2xl font-semibold text-[var(--marigold)]">
            From {formatMoney(cashPlanCents(cashCurrency), cashCurrency)}
            <span className="text-sm font-normal text-[var(--muted)]"> /mo</span>
          </p>
          <PlanFeatureBlock plan="cash" currency={cashCurrency} />
          <div className="flex flex-wrap items-end gap-3 pt-1">
            <CurrencySelect
              codes={cashCodes}
              value={cashCurrency}
              onChange={setCashCurrency}
              centsFor={cashPlanCents}
            />
            <button
              type="submit"
              disabled={!cashConfigured}
              className="rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm font-semibold disabled:opacity-50"
            >
              Subscribe to Cash
            </button>
          </div>
        </form>
      ) : null}

      {showCard ? (
        <form
          action={startCardPlanCheckout}
          className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4"
        >
          <p className="text-sm font-semibold text-[var(--leaf)]">
            Card / Tap &amp; Go plan
          </p>
          <p className="font-receipt text-2xl font-semibold text-[var(--marigold)]">
            From {formatMoney(cardPlanCents(cardCurrency), cardCurrency)}
            <span className="text-sm font-normal text-[var(--muted)]"> /mo</span>
          </p>
          <PlanFeatureBlock plan="card" currency={cardCurrency} />
          <div className="flex flex-wrap items-end gap-3 pt-1">
            <CurrencySelect
              codes={cardCodes}
              value={cardCurrency}
              onChange={setCardCurrency}
              centsFor={cardPlanCents}
            />
            <button
              type="submit"
              disabled={!cardConfigured}
              className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-50"
            >
              Subscribe to Card
            </button>
          </div>
          {!cardConfigured ? (
            <p className="text-sm text-red-700">
              Card plan Price IDs are not set on the server yet (STRIPE_PRICE_ID_CARD_*).
            </p>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}

function CurrencySelect({
  codes,
  value,
  onChange,
  centsFor,
}: {
  codes: BillingCurrency[];
  value: BillingCurrency;
  onChange: (currency: BillingCurrency) => void;
  centsFor: (currency: BillingCurrency) => number;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-[var(--ink)]">Currency</span>
      <select
        name="currency"
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          if (isBillingCurrency(next)) onChange(next);
        }}
        className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
      >
        {codes.map((code) => (
          <option key={code} value={code}>
            {code} · {formatMoney(centsFor(code), code)}/mo
          </option>
        ))}
      </select>
    </label>
  );
}
