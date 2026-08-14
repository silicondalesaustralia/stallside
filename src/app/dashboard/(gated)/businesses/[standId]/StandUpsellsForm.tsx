"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateStand } from "../actions";
import StandConversionFields, {
  type StandConversionValues,
} from "./StandConversionFields";

export default function StandUpsellsForm({
  standId,
  currency,
  products,
  conversion,
}: {
  standId: string;
  currency: string;
  products: { id: string; name: string; priceCents: number }[];
  conversion: StandConversionValues;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const save = updateStand.bind(null, standId);

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
        console.error("Upsells save failed", error);
        setMessage("Could not save upsells. Try again.");
      }
    });
  }

  return (
    <form action={onSubmit} className="flex w-full flex-col gap-4">
      <input type="hidden" name="section" value="conversion" />
      <StandConversionFields
        currency={currency}
        products={products}
        values={conversion}
      />
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
        {pending ? "Saving…" : "Save upsells"}
      </button>
    </form>
  );
}
