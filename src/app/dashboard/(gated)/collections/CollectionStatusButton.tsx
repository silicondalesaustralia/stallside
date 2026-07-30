"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { advanceCollectionStatus } from "./actions";

export default function CollectionStatusButton({
  orderId,
  status,
}: {
  orderId: string;
  status: "ORDERED" | "READY" | "COLLECTED";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (status === "COLLECTED") {
    return (
      <span className="text-sm font-medium text-[var(--ok)]">Collected</span>
    );
  }

  const label = status === "ORDERED" ? "Mark ready" : "Mark collected";

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
