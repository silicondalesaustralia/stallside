"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import QrTargetPicker from "@/components/qr/QrTargetPicker";
import { qrTargetKey, type QrTarget, type QrTargetOption } from "@/lib/qr/target-types";
import { setQrTarget } from "@/app/dashboard/(gated)/qr/[qrId]/qr-edit-actions";

export default function QrDestinationCard({
  qrId,
  target,
  options,
}: {
  qrId: string;
  target: QrTarget | null;
  options: QrTargetOption[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [choice, setChoice] = useState<QrTargetOption | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const current = target ? options.find((o) => qrTargetKey(o) === qrTargetKey(target)) ?? null : null;

  function confirmChange() {
    if (!choice) return;
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await setQrTarget(qrId, choice.kind, choice.id);
        if ("error" in result) return setMessage(result.error);
        setEditing(false);
        setChoice(null);
        router.refresh();
      } catch (err) {
        console.error("[qr] change page failed", err);
        setMessage("Could not change the page. Please try again.");
      }
    });
  }

  return (
    <section className="dash-card flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">Opens</h2>
        <div className="flex gap-3 text-sm">
          <button type="button" onClick={() => setEditing((v) => !v)} className="underline">
            {editing ? "Cancel" : "Change page"}
          </button>
          <Link href={`/dashboard/qr/${qrId}/duplicate`} className="underline">
            Duplicate for another page
          </Link>
        </div>
      </div>
      {current ? (
        <p className="text-sm">
          <span className="font-semibold">{current.label}</span>{" "}
          <span className="text-[var(--muted)]">({current.path})</span>
        </p>
      ) : (
        <p className="text-sm text-[var(--warn)]">
          The page this QR opened has been removed, so scans open your website home. Pick a new page.
        </p>
      )}
      {editing ? (
        <>
          <p className="rounded-lg bg-[var(--wash)] px-3 py-2 text-xs">
            Posters already printed with this QR code will open the new page too. To keep this one and add
            another, use <em>Duplicate for another page</em> instead.
          </p>
          <QrTargetPicker options={options} value={choice ?? target} onChange={setChoice} />
          <button
            type="button"
            disabled={!choice || pending}
            onClick={confirmChange}
            className="self-start rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Changing…" : choice ? `Open ${choice.label} instead` : "Pick a page"}
          </button>
        </>
      ) : null}
      {message ? <p className="text-sm text-[var(--warn)]">{message}</p> : null}
    </section>
  );
}
