"use client";

import { useActionState } from "react";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { BILLING_CURRENCIES, type BillingCurrency } from "@/lib/saas-pricing";
import {
  searchDomainsAction,
  type SearchDomainState,
} from "./search-actions";

function money(cents?: { currencyCode: string; value: number }) {
  if (!cents) return null;
  return `${cents.currencyCode} ${(cents.value / 100).toFixed(2)}`;
}

export default function BuyDomainSearch({
  purchaseEnabled,
  defaultCurrency = "AUD",
}: {
  purchaseEnabled: boolean;
  defaultCurrency?: BillingCurrency;
}) {
  const initial: SearchDomainState = {
    query: "",
    currency: defaultCurrency,
    hits: [],
  };
  const [state, action, pending] = useActionState(searchDomainsAction, initial);
  const currency = state.currency || defaultCurrency;

  return (
    <section className="dash-card flex flex-col gap-4 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Buy a domain
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Search .com.au, .com, and .net.au. You&apos;ll be the legal registrant.
        </p>
      </div>
      <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-2 text-sm">
          <span className="font-medium">Business or farm name</span>
          <input
            name="query"
            required
            minLength={2}
            defaultValue={state.query}
            placeholder="greenvalleyfarm"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          />
        </label>
        <label className="flex w-full flex-col gap-2 text-sm sm:w-32">
          <span className="font-medium">Currency</span>
          <select
            name="currency"
            defaultValue={currency}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          >
            {BILLING_CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={pending} className={dashCtaClass}>
          {pending ? "Searching…" : "Search"}
        </button>
      </form>
      {state.error ? (
        <p className="text-sm text-[var(--gone)]">{state.error}</p>
      ) : null}
      {state.hits.length > 0 ? (
        <ul className="divide-y divide-[var(--line)] border-t border-[var(--line)]">
          {state.hits.map((h) => (
            <li
              key={h.domain}
              className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
            >
              <div>
                <p className="font-mono font-semibold text-[var(--field)]">
                  {h.domain}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {h.available
                    ? [
                        money(h.retailRegistration)
                          ? `From ${money(h.retailRegistration)}`
                          : money(h.registration)
                            ? `Register ${money(h.registration)}`
                            : null,
                        money(h.retailRenewal)
                          ? `renew ${money(h.retailRenewal)}/yr`
                          : money(h.renewal)
                            ? `renew ${money(h.renewal)}/yr`
                            : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "Available"
                    : "Taken"}
                  {h.premium ? " · Premium" : ""}
                </p>
              </div>
              {h.available && !h.premium ? (
                purchaseEnabled ? (
                  <a
                    href={`/dashboard/website/domains/buy?domain=${encodeURIComponent(h.domain)}&currency=${encodeURIComponent(currency)}`}
                    className={dashCtaClass}
                  >
                    Continue
                  </a>
                ) : (
                  <span className="text-xs text-[var(--muted)]">
                    Purchase not enabled yet
                  </span>
                )
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
