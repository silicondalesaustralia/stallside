"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createSubscriptionOffer } from "./actions-create";
import { updateSubscriptionOffer } from "./actions-update";
import type { ShopperInterval } from "@/lib/subscription-offer";

type ProductOpt = { id: string; name: string; priceCents: number };

type OfferValues = {
  id?: string;
  title: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  interval: ShopperInterval;
  handoverMode: "COLLECT" | "DELIVER";
  collectionWeekday: number | null;
  collectionNote: string | null;
  productIds: string[];
  quantities: Record<string, number>;
};

export default function SubscriptionOfferForm({
  products,
  stripeConnected,
  currency,
  values,
}: {
  products: ProductOpt[];
  stripeConnected: boolean;
  currency: string;
  values?: OfferValues;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const editing = Boolean(values?.id);
  const selected = new Set(values?.productIds ?? []);

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      try {
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
        console.error("Subscription offer save failed", error);
        setMessage("Could not save. Try again.");
      }
    });
  }

  return (
    <form action={onSubmit} className="grid w-full gap-4 lg:grid-cols-2">
      {!stripeConnected ? (
        <p className="rounded-lg border border-[var(--warn)]/40 bg-[var(--warn)]/10 px-3 py-2 text-sm lg:col-span-2">
          Connect Stripe under Settings to publish card subscriptions.
        </p>
      ) : null}
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Title</span>
        <input
          name="title"
          required
          maxLength={120}
          defaultValue={values?.title ?? ""}
          placeholder="Weekly veg box"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">URL slug (optional)</span>
        <input
          name="slug"
          defaultValue={values?.slug ?? ""}
          placeholder="auto from title"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 font-receipt"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Description (optional)</span>
        <input
          name="description"
          defaultValue={values?.description ?? ""}
          maxLength={500}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
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
        <span className="font-medium">Billing interval</span>
        <select
          name="interval"
          defaultValue={values?.interval ?? "WEEKLY"}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        >
          <option value="WEEKLY">Weekly</option>
          <option value="FORTNIGHTLY">Fortnightly</option>
          <option value="MONTHLY">Monthly</option>
        </select>
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
        <span className="font-medium">Collection weekday (optional)</span>
        <select
          name="collectionWeekday"
          defaultValue={
            values?.collectionWeekday != null
              ? String(values.collectionWeekday)
              : ""
          }
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        >
          <option value="">Same as billing day</option>
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
        <span className="font-medium">Collection / delivery note</span>
        <input
          name="collectionNote"
          defaultValue={values?.collectionNote ?? ""}
          maxLength={200}
          placeholder="Pick up at the gate fridge"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <fieldset className="flex flex-col gap-2 rounded-lg border border-[var(--line)] p-4 lg:col-span-2">
        <legend className="px-1 text-sm font-medium">
          Products in the box ({currency})
        </legend>
        {products.length === 0 ? (
          <p className="text-sm text-[var(--warn)]">
            Add products first, then build a subscription.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {products.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="productIds"
                    value={p.id}
                    defaultChecked={selected.has(p.id)}
                    className="size-4"
                  />
                  {p.name}
                </label>
                <label className="flex items-center gap-1 text-[var(--muted)]">
                  Qty
                  <input
                    type="number"
                    name={`qty_${p.id}`}
                    min={1}
                    max={99}
                    defaultValue={values?.quantities[p.id] ?? 1}
                    className="w-16 rounded border border-[var(--line)] px-2 py-1"
                  />
                </label>
              </li>
            ))}
          </ul>
        )}
      </fieldset>
      <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
      {message ? (
        <p className="text-sm text-[var(--warn)]">{message}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-60"
      >
        {pending ? "Saving…" : editing ? "Save offer" : "Create offer"}
      </button>
      </div>
    </form>
  );
}
