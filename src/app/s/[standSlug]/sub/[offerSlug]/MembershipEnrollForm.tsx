"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { startShopperSubscriptionCheckout } from "../enroll-actions";
import {
  membershipSelectedSummary,
  parseUpfrontBenefits,
} from "@/lib/membership-offer-pricing";
import type { MembershipPlan } from "@/lib/subscription-offer";
import MembershipDeliveryFields from "./MembershipDeliveryFields";
import MembershipPlanPicker from "./MembershipPlanPicker";
import MembershipUpfrontBenefits from "./MembershipUpfrontBenefits";

type PlanOption = { plan: MembershipPlan; priceCents: number };

export default function MembershipEnrollForm({
  standSlug,
  offerSlug,
  currency,
  plans,
  termWeeks,
  upfrontBenefitsText,
  handoverDeliver,
}: {
  standSlug: string;
  offerSlug: string;
  currency: string;
  plans: PlanOption[];
  termWeeks: number | null;
  upfrontBenefitsText: string | null;
  handoverDeliver: boolean;
}) {
  const benefitsId = useId();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [billingPlan, setBillingPlan] = useState<MembershipPlan | "">(
    plans[0]?.plan ?? "",
  );
  const [benefitsOpen, setBenefitsOpen] = useState(false);
  const benefits = parseUpfrontBenefits(upfrontBenefitsText);
  const selected =
    plans.find((p) => p.plan === billingPlan) ?? plans[0] ?? null;

  useEffect(() => {
    setBenefitsOpen(billingPlan === "UPFRONT");
  }, [billingPlan]);

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await startShopperSubscriptionCheckout({
        standSlug,
        offerSlug,
        billingPlan: billingPlan || undefined,
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
      if (result.url) window.location.href = result.url;
    });
  }

  return (
    <form
      action={onSubmit}
      className="rounded-[18px] border border-[var(--m-card-border)] bg-[var(--m-card)] p-5 text-[var(--m-ink)] sm:p-6"
    >
      <h2 className="text-[19px] font-semibold">Make it your weekly ritual</h2>
      <MembershipPlanPicker
        plans={plans}
        currency={currency}
        termWeeks={termWeeks}
        billingPlan={billingPlan}
        onChange={setBillingPlan}
      />
      <MembershipUpfrontBenefits
        id={benefitsId}
        open={benefitsOpen}
        onToggle={() => setBenefitsOpen((o) => !o)}
        bullets={benefits.bullets}
        footnote={benefits.footnote}
      />
      <div className="mt-5">
        <h3 className="text-sm font-semibold">Your details</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Name</span>
            <input
              name="customerName"
              required
              autoComplete="name"
              className="rounded-[9px] border border-[var(--m-input-border)] bg-[var(--m-input)] px-3 py-2.5 text-base"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Email</span>
            <input
              name="customerEmail"
              type="email"
              required
              autoComplete="email"
              className="rounded-[9px] border border-[var(--m-input-border)] bg-[var(--m-input)] px-3 py-2.5 text-base"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium">Phone (optional)</span>
            <input
              name="customerPhone"
              autoComplete="tel"
              className="rounded-[9px] border border-[var(--m-input-border)] bg-[var(--m-input)] px-3 py-2.5 text-base"
            />
          </label>
        </div>
      </div>
      {handoverDeliver ? <MembershipDeliveryFields /> : null}
      {message ? (
        <p className="mt-3 text-sm text-[var(--warn)]">{message}</p>
      ) : null}
      {selected && billingPlan ? (
        <p className="mt-5 text-sm font-medium">
          {membershipSelectedSummary(
            billingPlan,
            selected.priceCents,
            currency,
          )}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending || !billingPlan}
        className="mt-3 w-full rounded-[9px] bg-[var(--m-button)] px-4 py-3 text-base font-semibold text-[var(--m-button-text)] disabled:opacity-60"
      >
        {pending ? "Starting…" : "Continue to payment →"}
      </button>
      <p className="mt-2 text-[12px] text-[var(--m-muted)]">
        Manage your membership through the link emailed after signup.
      </p>
    </form>
  );
}
