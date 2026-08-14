"use client";

import { useState, useTransition } from "react";
import { submitChannelInterest } from "./channel-interest-actions";

export default function ChannelInterestForm({
  standSlug,
  kind,
}: {
  standSlug: string;
  kind: "PREORDER" | "SUBSCRIPTION";
}) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const label = kind === "PREORDER" ? "pre-orders" : "subscriptions";

  function onSubmit(formData: FormData) {
    formData.set("standSlug", standSlug);
    formData.set("kind", kind);
    setError(null);
    startTransition(async () => {
      const result = await submitChannelInterest(formData);
      if (result && "error" in result && result.error) {
        setError(result.error);
        return;
      }
      setSent(true);
    });
  }

  if (sent) {
    return (
      <p className="mt-4 text-lg text-[var(--leaf)]">
        Thanks — we&apos;ve told the stall you&apos;d like {label}.
      </p>
    );
  }

  return (
    <form action={onSubmit} className="mt-4 flex flex-col gap-3">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">
          I would be interested in {label} if you made them available
        </span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-50"
      >
        {pending ? "Sending…" : "Tell the stall"}
      </button>
      {error ? <p className="text-sm text-[var(--gone)]">{error}</p> : null}
    </form>
  );
}
