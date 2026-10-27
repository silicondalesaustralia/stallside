"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { advanceCollectionStatus } from "./actions";

export default function CollectionStatusButton({
  orderId,
  status,
  payOnCollect = false,
}: {
  orderId: string;
  status: "ORDERED" | "READY" | "COLLECTED";
  /** Pay-at-pickup order: collecting also marks it paid. */
  payOnCollect?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (status === "COLLECTED") {
    return (
      <span className="text-sm font-medium text-[var(--ok)]">Collected</span>
    );
  }

  const label =
    status === "ORDERED"
      ? "Mark ready"
      : payOnCollect
        ? "Paid & collected"
        : "Mark collected";

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await advanceCollectionStatus(orderId);
          router.refresh();
        });
      }}
      className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-sm font-semibold hover:border-[var(--leaf)] disabled:opacity-50"
    >
      {pending ? "…" : label}
    </button>
  );
}
