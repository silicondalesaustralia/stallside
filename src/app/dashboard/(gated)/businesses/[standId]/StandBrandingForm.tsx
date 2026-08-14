"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateStand } from "../actions";
import StandBrandingFields, {
  type StandBrandingValues,
} from "./StandBrandingFields";

export default function StandBrandingForm({
  standId,
  branding,
}: {
  standId: string;
  branding: StandBrandingValues;
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
        console.error("Branding save failed", error);
        setMessage("Could not save branding. Try again.");
      }
    });
  }

  return (
    <form action={onSubmit} className="flex w-full flex-col gap-4">
      <input type="hidden" name="section" value="branding" />
      <StandBrandingFields {...branding} />
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
        {pending ? "Saving…" : "Save branding"}
      </button>
    </form>
  );
}
