"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { saveSellerNotes } from "../actions";

export default function OpsSellerNotesForm({
  orderId,
  notes,
}: {
  orderId: string;
  notes: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="dash-card flex flex-col gap-3 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          await saveSellerNotes(fd);
          router.refresh();
        });
      }}
    >
      <input type="hidden" name="orderId" value={orderId} />
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">Seller notes</span>
        <textarea
          name="notes"
          defaultValue={notes}
          rows={3}
          maxLength={2000}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          placeholder="Internal packing notes"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold hover:border-[var(--leaf)] disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save notes"}
      </button>
    </form>
  );
}
