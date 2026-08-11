"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CURRENCIES } from "@/lib/constants";
import { updateStand } from "../actions";

type StandFields = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  locationLabel: string | null;
  currency: string;
  showExactStock: boolean;
  isActive: boolean;
};

export default function StandEditForm({ stand }: { stand: StandFields }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const save = updateStand.bind(null, stand.id);

  function onSubmit(formData: FormData) {
    const payload = new FormData();
    for (const [key, value] of formData.entries()) {
      payload.append(key, value);
    }
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
    <form action={onSubmit} className="flex max-w-lg flex-col gap-4">
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
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Checkout link slug</span>
        <input
          name="slug"
          defaultValue={stand.slug}
          required
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
        <span className="text-[var(--muted)]">Appears in /s/your-slug</span>
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Instructions for customers</span>
        <textarea
          name="description"
          defaultValue={stand.description ?? ""}
          rows={3}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
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
              {c}
            </option>
          ))}
        </select>
        <span className="text-[var(--muted)]">
          PayID only appears for AUD under Checkout payments.
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
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={stand.isActive}
          className="size-4"
        />
        Public checkout enabled
      </label>
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
    </form>
  );
}
