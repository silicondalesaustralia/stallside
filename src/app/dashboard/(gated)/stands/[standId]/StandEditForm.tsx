"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CURRENCIES } from "@/lib/constants";
import { updateStand } from "../actions";
import LocalTransferAliasFields from "./LocalTransferAliasFields";

type StandFields = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  locationLabel: string | null;
  currency: string;
  localTransferAlias: string | null;
  localTransferMethodId: string | null;
  showExactStock: boolean;
  isActive: boolean;
};

export default function StandEditForm({ stand }: { stand: StandFields }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [currency, setCurrency] = useState(stand.currency);
  const [pending, startTransition] = useTransition();
  const save = updateStand.bind(null, stand.id);

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await save(formData);
      if (result && "error" in result && result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Saved.");
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="standId" value={stand.id} />
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Name</span>
        <input
          name="name"
          defaultValue={stand.name}
          required
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Slug</span>
        <input
          name="slug"
          defaultValue={stand.slug}
          required
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Instructions</span>
        <textarea
          name="description"
          defaultValue={stand.description ?? ""}
          rows={3}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Location</span>
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
          value={currency}
          onChange={(event) => setCurrency(event.target.value)}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <LocalTransferAliasFields
        currency={currency}
        alias={stand.localTransferAlias}
        methodId={stand.localTransferMethodId}
      />
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
        <input type="checkbox" name="isActive" defaultChecked={stand.isActive} className="size-4" />
        Public checkout enabled
      </label>
      {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save stand"}
      </button>
    </form>
  );
}
