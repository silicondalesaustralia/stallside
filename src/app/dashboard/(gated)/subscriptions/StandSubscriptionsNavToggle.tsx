"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateStandSubscriptionsNav } from "./stand-subscriptions-nav-action";

export default function StandSubscriptionsNavToggle({
  standId,
  enabled,
  publicPath,
}: {
  standId: string;
  enabled: boolean;
  publicPath: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-col gap-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4"
      action={(formData) => {
        setMessage(null);
        startTransition(async () => {
          const result = await updateStandSubscriptionsNav(standId, formData);
          if (result.error) {
            setMessage(result.error);
            return;
          }
          setMessage("Saved.");
          router.refresh();
        });
      }}
    >
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          name="showSubscriptionsOnStand"
          defaultChecked={enabled}
          className="mt-0.5 size-4"
        />
        <span>
          <span className="font-medium">
            Show Memberships on the stand page
          </span>
          <span className="mt-1 block text-[var(--muted)]">
            Adds a Memberships link next to Shop / Pre-orders. Public list:{" "}
            <a href={publicPath} className="underline" target="_blank" rel="noreferrer">
              {publicPath}
            </a>
          </span>
        </span>
      </label>
      <div className="flex flex-wrap items-center gap-3">
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
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-sm font-medium disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save nav setting"}
        </button>
      </div>
    </form>
  );
}
