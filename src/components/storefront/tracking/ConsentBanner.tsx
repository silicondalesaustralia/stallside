"use client";

import type { ConsentChoice } from "@/lib/website/tracking/consent";

/** Bottom cookie banner; Accept and Decline carry equal weight (GDPR-style). */
export default function ConsentBanner({
  privacyHref,
  current,
  onDecide,
  onClose,
}: {
  privacyHref: string;
  current: ConsentChoice | null;
  onDecide: (choice: ConsentChoice) => void;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie settings"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl rounded-2xl border border-black/10 bg-white p-4 text-sm text-neutral-800 shadow-xl"
    >
      <p>
        We use cookies for analytics and advertising to understand visits and measure our ads.{" "}
        <a href={privacyHref} className="underline">
          Privacy policy
        </a>
      </p>
      {current ? (
        <p className="mt-1 text-xs text-neutral-500">
          Current choice: {current === "granted" ? "accepted" : "declined"}. Changes to declined apply from your next page load.
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onDecide("granted")}
          className="rounded-full bg-neutral-900 px-4 py-2 font-semibold text-white"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => onDecide("denied")}
          className="rounded-full bg-neutral-900 px-4 py-2 font-semibold text-white"
        >
          Decline
        </button>
        {current ? (
          <button type="button" onClick={onClose} className="rounded-full px-3 py-2 text-neutral-600 underline">
            Close
          </button>
        ) : null}
      </div>
    </div>
  );
}
