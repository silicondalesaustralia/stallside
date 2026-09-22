"use client";

import { useState, useTransition } from "react";
import { startShopperSubscriptionCheckout } from "../enroll-actions";
import { formatMoney } from "@/lib/money";
import {
  intervalLabel,
  membershipPlanLabel,
  type MembershipPlan,
  type ShopperInterval,
} from "@/lib/subscription-offer";

type Line = { name: string; quantity: number; lineTotalCents: number };

type PlanOption = {
  plan: MembershipPlan;
  priceCents: number;
};

export default function SubscriptionEnrollForm({
  standSlug,
  offerSlug,
  title,
  interval,
  priceCents,
  currency,
  handoverDeliver,
  lines,
  membership,
  plans,
  upfrontBenefitsText,
}: {
  standSlug: string;
  offerSlug: string;
  title: string;
  interval: ShopperInterval;
  priceCents: number;
  currency: string;
  handoverDeliver: boolean;
  lines: Line[];
  membership: boolean;
  plans: PlanOption[];
  upfrontBenefitsText: string | null;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [billingPlan, setBillingPlan] = useState<MembershipPlan | "">(
    plans[0]?.plan ?? "",
  );

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await startShopperSubscriptionCheckout({
        standSlug,
        offerSlug,
        billingPlan: membership ? billingPlan || undefined : undefined,
        customerName: String(formData.get("customerName") ?? ""),
        customerEmail: String(formData.get("customerEmail") ?? ""),
        customerPhone: String(formData.get("customerPhone") ?? ""),
        deliveryAddressLine1: String(
          formData.get("deliveryAddressLine1") ?? "",
        ),
        deliverySuburb: String(formData.get("deliverySuburb") ?? ""),
        deliveryPostcode: String(formData.get("deliveryPostcode") ?? ""),
        deliveryNotes: String(formData.get("deliveryNotes") ?? ""),
      });
      if (result.error) {
        setMessage(result.error);
        return;
      }
      if (result.url) {
        window.location.href = result.url;
      }
    });
  }

  const selectedPrice =
    plans.find((p) => p.plan === billingPlan)?.priceCents ?? priceCents;

  return (
    <form action={onSubmit} className="flex flex-col gap-4">
      <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
        <p className="font-semibold">{title}</p>
        {!membership ? (
          <p className="mt-1 text-[var(--muted)]">
            {intervalLabel(interval)} · {formatMoney(priceCents, currency)}
          </p>
        ) : null}
        {lines.length > 0 && !membership ? (
          <ul className="mt-3 flex flex-col gap-1">
            {lines.map((l) => (
              <li key={l.name} className="flex justify-between gap-2">
                <span>
                  {l.name}
                  {l.quantity > 1 ? ` × ${l.quantity}` : ""}
                </span>
                <span>{formatMoney(l.lineTotalCents, currency)}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {membership && plans.length > 0 ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">How would you like to pay?</legend>
          {plans.map((p) => (
            <label
              key={p.plan}
              className="flex cursor-pointer items-start gap-2 rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            >
              <input
                type="radio"
                name="billingPlan"
                value={p.plan}
                checked={billingPlan === p.plan}
                onChange={() => setBillingPlan(p.plan)}
                className="mt-1"
              />
              <span>
                <span className="font-medium">
                  {membershipPlanLabel(p.plan)} ·{" "}
                  {formatMoney(p.priceCents, currency)}
                </span>
                {p.plan === "UPFRONT" && upfrontBenefitsText ? (
                  <span className="mt-1 block whitespace-pre-wrap text-[var(--muted)]">
                    {upfrontBenefitsText}
                  </span>
                ) : null}
              </span>
            </label>
          ))}
          <p className="text-xs text-[var(--muted)]">
            Collection is weekly. Selected total:{" "}
            {formatMoney(selectedPrice, currency)}
          </p>
        </fieldset>
      ) : null}
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Name</span>
        <input
          name="customerName"
          required
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Email</span>
        <input
          name="customerEmail"
          type="email"
          required
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Phone (optional)</span>
        <input
          name="customerPhone"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      {handoverDeliver ? (
        <>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Address</span>
            <input
              name="deliveryAddressLine1"
              required
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Suburb</span>
              <input
                name="deliverySuburb"
                required
                className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Postcode</span>
              <input
                name="deliveryPostcode"
                required
                className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Delivery notes</span>
            <input
              name="deliveryNotes"
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
            />
          </label>
        </>
      ) : null}
      {message ? (
        <p className="text-sm text-[var(--warn)]">{message}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending || (membership && !billingPlan)}
        className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Starting…" : "Continue to payment"}
      </button>
      <p className="text-xs text-[var(--muted)]">
        You can manage your membership from the link emailed after signup.
      </p>
    </form>
  );
}
