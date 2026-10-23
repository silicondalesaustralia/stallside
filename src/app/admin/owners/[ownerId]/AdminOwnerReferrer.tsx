"use client";

import { useState, useTransition } from "react";
import { setOwnerReferrer } from "@/app/admin/affiliates/actions";

export default function AdminOwnerReferrer({
  ownerId,
  referrer,
  referralCode,
}: {
  ownerId: string;
  referrer: { businessName: string; referralCode: string | null } | null;
  referralCode: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await setOwnerReferrer(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update referrer");
      }
    });
  }

  return (
    <section className="dash-card space-y-3 p-5 text-sm">
      <h2 className="text-lg font-semibold">Affiliate</h2>
      <p>Own referral code: {referralCode ? <code className="text-xs">{referralCode}</code> : "-"}</p>
      <p>
        Referred by:{" "}
        {referrer ? `${referrer.businessName} (${referrer.referralCode ?? "no code"})` : "-"}
      </p>
      <form action={onSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input type="hidden" name="ownerId" value={ownerId} />
        <input
          type="text"
          name="referralCode"
          defaultValue={referrer?.referralCode ?? ""}
          placeholder="Affiliate code (blank to clear)"
          className="rounded-[var(--radius)] border border-[var(--line)] px-3 py-2"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full border border-[var(--field)] px-4 py-2 font-semibold disabled:opacity-60"
        >
          {pending ? "Saving…" : "Set referrer"}
        </button>
      </form>
      <p className="text-xs text-[var(--muted)]">
        Only invoices paid after this change earn commission.
      </p>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </section>
  );
}
