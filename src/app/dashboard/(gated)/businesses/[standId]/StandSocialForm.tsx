"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateStand } from "../actions";
import StandSocialFields from "./StandSocialFields";

export type StandSocialValues = {
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  websiteUrl: string | null;
};

export default function StandSocialForm({
  standId,
  social,
}: {
  standId: string;
  social: StandSocialValues;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const save = updateStand.bind(null, standId);

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await save(formData);
        if (result && "error" in result && result.error) {
          setMessage(result.error);
          return;
        }
        setMessage("Saved.");
        router.refresh();
      } catch (error) {
        console.error("Social links save failed", error);
        setMessage("Could not save social links. Try again.");
      }
    });
  }

  return (
    <form
      action={onSubmit}
      className="flex w-full flex-col gap-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4"
    >
      <input type="hidden" name="section" value="social" />
      <StandSocialFields {...social} />
      {message ? (
        <p
          className={`text-sm ${
            message === "Saved." ? "text-[var(--leaf-dark)]" : "text-[var(--warn)]"
          }`}
        >
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save social links"}
      </button>
    </form>
  );
}
