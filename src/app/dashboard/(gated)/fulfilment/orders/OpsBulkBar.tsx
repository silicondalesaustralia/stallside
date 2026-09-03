"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { FulfilmentStatus } from "@/lib/ops/enums";
import { bulkSetOpsStatus } from "./actions";

export default function OpsBulkBar({
  selectedIds,
  onClear,
}: {
  selectedIds: string[];
  onClear: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const count = selectedIds.length;
  if (count === 0) return null;

  const idsQuery = selectedIds.map(encodeURIComponent).join(",");

  function run(status: FulfilmentStatus) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("status", status);
      for (const id of selectedIds) fd.append("orderIds", id);
      await bulkSetOpsStatus(fd);
      onClear();
      router.refresh();
    });
  }

  const btn =
    "rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-sm font-semibold hover:border-[var(--leaf)] disabled:opacity-50";

  return (
    <div className="sticky top-2 z-20 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--wash)] p-3 shadow-sm">
      <p className="mr-2 text-sm font-medium">
        {count} selected
      </p>
      <button type="button" disabled={pending} className={btn} onClick={() => run(FulfilmentStatus.PREPARING)}>
        Preparing
      </button>
      <button type="button" disabled={pending} className={btn} onClick={() => run(FulfilmentStatus.READY)}>
        Ready
      </button>
      <button type="button" disabled={pending} className={btn} onClick={() => run(FulfilmentStatus.COLLECTED)}>
        Collected
      </button>
      <button type="button" disabled={pending} className={btn} onClick={() => run(FulfilmentStatus.OUT_FOR_DELIVERY)}>
        Out for delivery
      </button>
      <button type="button" disabled={pending} className={btn} onClick={() => run(FulfilmentStatus.DELIVERED)}>
        Delivered
      </button>
      <Link
        href={`/dashboard/fulfilment/orders/print/packing?ids=${idsQuery}`}
        className="text-sm font-semibold text-[var(--leaf-dark)] underline"
      >
        Print packing
      </Link>
      <Link
        href={`/dashboard/fulfilment/orders/print/labels?ids=${idsQuery}`}
        className="text-sm font-semibold text-[var(--leaf-dark)] underline"
      >
        Print labels
      </Link>
      <button
        type="button"
        className="text-sm text-[var(--muted)] underline"
        onClick={onClear}
      >
        Clear
      </button>
    </div>
  );
}
