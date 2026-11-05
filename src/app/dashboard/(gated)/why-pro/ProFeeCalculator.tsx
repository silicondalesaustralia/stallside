"use client";

import { useId, useRef, useState } from "react";
import { trackProUpgrade } from "@/lib/pro-upgrade-track";
import { formatProMoney } from "./why-pro-copy";

type Props = { currency: string; feeBps: number; monthlyCents: number; annualCents: number | null };

const DEFAULT_SALES = "1000";

function netLine(avoidedCents: number, priceCents: number, currency: string): string {
  const net = avoidedCents - priceCents;
  if (net >= 0) return `${formatProMoney(net, currency)} more than Pro costs`;
  return `${formatProMoney(-net, currency)} less than Pro costs, so fee savings alone don't cover Pro at this volume`;
}

/** Vendl fees avoided on eligible card sales vs the Pro price (monthly, or annual as a labelled monthly equivalent). */
export default function ProFeeCalculator({ currency, feeBps, monthlyCents, annualCents }: Props) {
  const inputId = useId();
  const [sales, setSales] = useState(DEFAULT_SALES);
  const tracked = useRef(false);
  const salesCents = Math.max(0, Math.round((Number(sales) || 0) * 100));
  const avoidedCents = Math.round((salesCents * feeBps) / 10_000);
  const breakEvenCents = Math.round((monthlyCents * 10_000) / feeBps);
  const annualMonthlyCents = annualCents === null ? null : Math.round(annualCents / 12);

  function onChange(value: string) {
    setSales(value);
    if (!tracked.current) {
      tracked.current = true;
      trackProUpgrade("pro_upgrade_demo_interaction", { demo: "fee_calculator" });
    }
  }

  return (
    <article aria-labelledby="demo-fees" className="dash-card flex flex-col gap-4 p-5">
      <div>
        <h3 id="demo-fees" className="text-lg font-semibold text-[var(--field)]">
          See what you could save on Vendl fees
        </h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Pro removes Vendl&apos;s {feeBps / 100}% fee on eligible card transactions. Estimate the difference at your
          current sales volume.
        </p>
      </div>
      <label htmlFor={inputId} className="flex max-w-xs flex-col gap-1 text-sm font-medium">
        Eligible monthly card sales ({currency})
        <input
          id={inputId}
          type="number"
          inputMode="decimal"
          min={0}
          step={50}
          value={sales}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-base tabular-nums focus-visible:outline-2 focus-visible:outline-[var(--leaf)]"
        />
      </label>
      <dl className="grid gap-3 text-sm sm:grid-cols-2" aria-live="polite">
        <div className="rounded-xl bg-[var(--wash)]/60 p-4">
          <dt className="text-[var(--muted)]">Vendl fees avoided each month</dt>
          <dd className="mt-1 text-xl font-semibold tabular-nums text-[var(--field)]">
            {formatProMoney(avoidedCents, currency)}
          </dd>
          <dd className="text-xs text-[var(--muted)]">
            {formatProMoney(salesCents, currency)} × {feeBps / 100}%
          </dd>
        </div>
        <div className="rounded-xl bg-[var(--wash)]/60 p-4">
          <dt className="text-[var(--muted)]">Compared with Pro monthly ({formatProMoney(monthlyCents, currency)})</dt>
          <dd className="mt-1 font-semibold text-[var(--field)]">{netLine(avoidedCents, monthlyCents, currency)}</dd>
          <dd className="text-xs text-[var(--muted)]">
            Fee savings cover Pro monthly from {formatProMoney(breakEvenCents, currency)} a month in eligible sales.
          </dd>
        </div>
        {annualMonthlyCents === null ? null : (
          <div className="rounded-xl bg-[var(--wash)]/60 p-4 sm:col-span-2">
            <dt className="text-[var(--muted)]">
              Compared with Pro annual ({formatProMoney(annualCents ?? 0, currency)} a year, or{" "}
              {formatProMoney(annualMonthlyCents, currency)} a month equivalent)
            </dt>
            <dd className="mt-1 font-semibold text-[var(--field)]">{netLine(avoidedCents, annualMonthlyCents, currency)}</dd>
          </div>
        )}
      </dl>
      <p className="text-xs text-[var(--muted)]">
        Illustrative estimate based on eligible sales. Payment provider fees still apply. Other Pro benefits are not
        included in this calculation.
      </p>
    </article>
  );
}
