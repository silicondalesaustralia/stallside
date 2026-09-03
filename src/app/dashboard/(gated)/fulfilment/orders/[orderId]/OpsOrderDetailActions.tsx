"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { FulfilmentStatus, HandoverMode } from "@/lib/ops/enums";
import {
  canTransitionOps,
  nextHandoverStatus,
  OPS_STATUS_LABEL,
} from "@/lib/ops/status";
import { bulkSetOpsStatus } from "../actions";

export default function OpsOrderDetailActions({
  orderId,
  status,
  handover,
}: {
  orderId: string;
  status: FulfilmentStatus;
  handover: HandoverMode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const handoverNext = nextHandoverStatus(status, handover);

  function setStatus(next: FulfilmentStatus) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("status", next);
      fd.append("orderIds", orderId);
      await bulkSetOpsStatus(fd);
      router.refresh();
    });
  }

  const btn =
    "rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm font-semibold hover:border-[var(--leaf)] disabled:opacity-50";

  return (
    <section className="dash-card flex flex-wrap gap-2 p-5">
      <button
        type="button"
        className={btn}
        disabled={pending || !canTransitionOps(status, FulfilmentStatus.PREPARING)}
        onClick={() => setStatus(FulfilmentStatus.PREPARING)}
      >
        Preparing
      </button>
      <button
        type="button"
        className={btn}
        disabled={pending || !canTransitionOps(status, FulfilmentStatus.READY)}
        onClick={() => setStatus(FulfilmentStatus.READY)}
      >
        Packed / Ready
      </button>
      {handoverNext ? (
        <button
          type="button"
          className={btn}
          disabled={pending || !canTransitionOps(status, handoverNext)}
          onClick={() => setStatus(handoverNext)}
        >
          {OPS_STATUS_LABEL[handoverNext]}
        </button>
      ) : null}
    </section>
  );
}
