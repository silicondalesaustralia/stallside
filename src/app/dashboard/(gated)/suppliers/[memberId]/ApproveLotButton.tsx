"use client";

import { useTransition } from "react";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { approveSupplierLot } from "./link-actions";

export default function ApproveLotButton({
  memberId,
  lotId,
  label,
}: {
  memberId: string;
  lotId: string;
  label: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await approveSupplierLot(formData);
        });
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <input type="hidden" name="memberId" value={memberId} />
      <input type="hidden" name="lotId" value={lotId} />
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <button type="submit" disabled={pending} className={dashCtaClass}>
        {pending ? "Approving…" : "Approve into stock"}
      </button>
    </form>
  );
}
