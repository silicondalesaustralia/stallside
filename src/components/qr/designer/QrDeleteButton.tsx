"use client";

import { unstable_rethrow } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteQrCode } from "@/app/dashboard/(gated)/qr/actions";

export default function QrDeleteButton({ qrId }: { qrId: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function onDelete() {
    const ok = window.confirm(
      "Delete this QR code? Any posters already printed with it will stop opening your shop.",
    );
    if (!ok) return;
    startTransition(async () => {
      try {
        const result = await deleteQrCode(qrId);
        if (result && "error" in result) setMessage(result.error);
      } catch (err) {
        unstable_rethrow(err);
        setMessage("Could not delete. Please try again.");
      }
    });
  }

  return (
    <span className="flex items-center gap-2">
      {message ? <span className="text-sm text-[var(--warn)]">{message}</span> : null}
      <button type="button" onClick={onDelete} disabled={pending} className="text-sm text-[var(--warn)] underline">
        {pending ? "Deleting…" : "Delete QR code"}
      </button>
    </span>
  );
}
