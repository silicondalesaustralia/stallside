"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { CURRENCIES } from "@/lib/constants";
import {
  STAND_TIMEZONES,
  resolveStandTimezone,
} from "@/lib/stand-timezone";
import type { BusinessSiteUrl } from "@/lib/storefront/business-site-url";
import { updateStand } from "../actions";
import StandSiteUrlField from "./StandSiteUrlField";

type StandFields = {
  id: string;
  name: string;
  locationLabel: string | null;
  currency: string;
  timezone: string;
  showExactStock: boolean;
};

export default function StandEditForm({ stand, site }: { stand: StandFields; site: BusinessSiteUrl | null }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const save = updateStand.bind(null, stand.id);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = new FormData(event.currentTarget);
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await save(payload);
        if (result && "error" in result && result.error) {
          setMessage(result.error);
          return;
        }
        setMessage("Saved.");
        router.refresh();
      } catch (error) {
        console.error("Business save failed", error);
        setMessage("Could not save. Try again.");
      }
    });
  }

  return (
    <form
      key={`${stand.id}:${stand.currency}`}
      onSubmit={onSubmit}
      className="grid w-full gap-4 sm:grid-cols-2"
    >
      <input type="hidden" name="section" value="details" />
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Business name</span>
        <input
          name="name"
          defaultValue={stand.name}
          required
          minLength={2}
          maxLength={80}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <StandSiteUrlField site={site} />
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Suburb / location</span>
        <input
          name="locationLabel"
          defaultValue={stand.locationLabel ?? ""}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Currency</span>
        <select
          name="currency"
          defaultValue={stand.currency}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c === "USD" ? "USD (United States)" : c}
            </option>
          ))}
        </select>
        <span className="text-[var(--muted)]">
          PayID only appears for AUD under Checkout.
        </span>
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Timezone</span>
        <select
          name="timezone"
          defaultValue={resolveStandTimezone(stand.timezone)}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        >
          {STAND_TIMEZONES.map((z) => (
            <option key={z.value} value={z.value}>
              {z.label}
            </option>
          ))}
        </select>
        <span className="text-[var(--muted)]">
          Pre-order order-by and collection times use this timezone.
        </span>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="showExactStock"
          defaultChecked={stand.showExactStock}
          className="size-4"
        />
        Show exact stock publicly
      </label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
      {message ? (
        <p
          className={`text-sm ${
            message === "Saved."
              ? "text-[var(--leaf-dark)]"
              : "text-[var(--warn)]"
          }`}
        >
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save details"}
      </button>
      </div>
    </form>
  );
}
