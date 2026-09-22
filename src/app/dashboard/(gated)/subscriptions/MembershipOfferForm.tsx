"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createSubscriptionOffer } from "./actions-create";
import { updateSubscriptionOffer } from "./actions-update";
import SubscriptionCoverImageField from "./SubscriptionCoverImageField";
import { PlanPriceRow, centsToDollars } from "./MembershipPlanFields";
import MembershipFieldHint from "./MembershipFieldHint";

const DESCRIPTION_TIP =
  "Short intro under the title on the public page. Keep it to one or two sentences about the share — do not put prices or retail comparisons here (those come from the payment plans).";

const BENEFITS_TIP =
  "Shown only for pay-in-full. Put one benefit per line, starting with • or -. Add a final line without a bullet for the footnote (e.g. “Discounts apply to other products only…”).";

const TERMS_TIP =
  "Becomes the FAQ accordion on the public page. Separate each Q&A with a blank line. First line = question/heading; lines below = answer. Add as many blocks as you need.";

export type MembershipOfferValues = {
  id?: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  handoverMode: "COLLECT" | "DELIVER";
  collectionWeekday: number | null;
  collectionNote: string | null;
  termWeeks: number;
  weeklyPriceCents: number | null;
  monthlyPriceCents: number | null;
  upfrontPriceCents: number | null;
  upfrontBenefitsText: string | null;
  termsText: string | null;
};

export default function MembershipOfferForm({
  stripeConnected,
  currency,
  values,
}: {
  stripeConnected: boolean;
  currency: string;
  values?: MembershipOfferValues;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const editing = Boolean(values?.id);
  const [weeklyOn, setWeeklyOn] = useState(values?.weeklyPriceCents != null);
  const [monthlyOn, setMonthlyOn] = useState(values?.monthlyPriceCents != null);
  const [upfrontOn, setUpfrontOn] = useState(values?.upfrontPriceCents != null);

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      try {
        formData.set("kind", "MEMBERSHIP");
        if (!weeklyOn) formData.delete("enableWeekly");
        if (!monthlyOn) formData.delete("enableMonthly");
        if (!upfrontOn) formData.delete("enableUpfront");
        const result = editing
          ? await updateSubscriptionOffer(values!.id!, formData)
          : await createSubscriptionOffer(formData);
        if (result && "error" in result && result.error) {
          setMessage(result.error);
          return;
        }
        if (editing) {
          setMessage("Saved.");
          router.refresh();
        }
      } catch (error) {
        console.error("Membership offer save failed", error);
        setMessage("Could not save. Try again.");
      }
    });
  }

  return (
    <form action={onSubmit} className="grid w-full gap-4 lg:grid-cols-2">
      {!stripeConnected ? (
        <p className="rounded-lg border border-[var(--warn)]/40 bg-[var(--warn)]/10 px-3 py-2 text-sm lg:col-span-2">
          Connect Stripe under Settings to publish card memberships.
        </p>
      ) : null}
      <input type="hidden" name="kind" value="MEMBERSHIP" />
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Title</span>
        <input
          name="title"
          required
          maxLength={120}
          defaultValue={values?.title ?? ""}
          placeholder="Ruby's Little Share"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">URL slug (optional)</span>
        <input
          name="slug"
          defaultValue={values?.slug ?? ""}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 font-receipt"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm lg:col-span-2">
        <span className="flex items-center gap-1.5 font-medium">
          Intro copy
          <MembershipFieldHint tip={DESCRIPTION_TIP} />
        </span>
        <textarea
          name="description"
          defaultValue={values?.description ?? ""}
          maxLength={2000}
          rows={3}
          placeholder={
            "A little connection to the herd.\nA litre of goat's milk reserved for you each week."
          }
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <SubscriptionCoverImageField imageUrl={values?.imageUrl ?? null} />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={values?.isActive ?? true}
          className="size-4"
        />
        Offer is live
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Term (weeks)</span>
        <input
          name="termWeeks"
          type="number"
          min={1}
          max={104}
          required
          defaultValue={values?.termWeeks ?? 26}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Handover</span>
        <select
          name="handoverMode"
          defaultValue={values?.handoverMode ?? "COLLECT"}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        >
          <option value="COLLECT">Collect</option>
          <option value="DELIVER">Deliver</option>
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Collection weekday</span>
        <select
          name="collectionWeekday"
          defaultValue={
            values?.collectionWeekday != null
              ? String(values.collectionWeekday)
              : ""
          }
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        >
          <option value="">After signup</option>
          <option value="1">Monday</option>
          <option value="2">Tuesday</option>
          <option value="3">Wednesday</option>
          <option value="4">Thursday</option>
          <option value="5">Friday</option>
          <option value="6">Saturday</option>
          <option value="0">Sunday</option>
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Collection note</span>
        <input
          name="collectionNote"
          defaultValue={values?.collectionNote ?? ""}
          maxLength={200}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <fieldset className="flex flex-col gap-3 rounded-lg border border-[var(--line)] p-4 lg:col-span-2">
        <legend className="px-1 text-sm font-medium">
          Payment plans ({currency})
        </legend>
        <p className="text-sm text-[var(--muted)]">
          Collection is always weekly. Enable at least one plan.
        </p>
        <PlanPriceRow
          enabled={weeklyOn}
          onToggle={setWeeklyOn}
          enableName="enableWeekly"
          priceName="weeklyPrice"
          label="Weekly"
          defaultDollars={centsToDollars(values?.weeklyPriceCents ?? null)}
        />
        <PlanPriceRow
          enabled={monthlyOn}
          onToggle={setMonthlyOn}
          enableName="enableMonthly"
          priceName="monthlyPrice"
          label="Monthly"
          defaultDollars={centsToDollars(values?.monthlyPriceCents ?? null)}
        />
        <PlanPriceRow
          enabled={upfrontOn}
          onToggle={setUpfrontOn}
          enableName="enableUpfront"
          priceName="upfrontPrice"
          label="Pay in full"
          defaultDollars={centsToDollars(values?.upfrontPriceCents ?? null)}
        />
      </fieldset>
      <label className="flex flex-col gap-2 text-sm lg:col-span-2">
        <span className="flex items-center gap-1.5 font-medium">
          Pay-in-full benefits
          <MembershipFieldHint tip={BENEFITS_TIP} />
        </span>
        <textarea
          name="upfrontBenefitsText"
          defaultValue={values?.upfrontBenefitsText ?? ""}
          maxLength={2000}
          rows={5}
          placeholder={
            "• One complimentary soap (valued at $12)\n• 10% off eligible products during the membership\n• First access to surplus milk\n\nDiscounts apply to other eligible products only — they do not further reduce the membership price."
          }
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm lg:col-span-2">
        <span className="flex items-center gap-1.5 font-medium">
          FAQ / details
          <MembershipFieldHint tip={TERMS_TIP} />
        </span>
        <textarea
          name="termsText"
          defaultValue={values?.termsText ?? ""}
          maxLength={5000}
          rows={8}
          placeholder={
            "Collection & planned absences\nCollect during the nominated window, or arrange for someone else…\n\nSeasonal supply & animal welfare\nAnimal welfare comes first. If a share cannot be supplied…"
          }
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
        {message ? (
          <p className="text-sm text-[var(--warn)]">{message}</p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : editing ? "Save offer" : "Create offer"}
        </button>
      </div>
    </form>
  );
}
