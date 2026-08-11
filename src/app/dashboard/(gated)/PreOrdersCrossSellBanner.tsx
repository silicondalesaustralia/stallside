"use client";

import Link from "next/link";
import { useTransition } from "react";
import { dismissPreOrdersCrossSell } from "./PreOrdersCrossSellActions";

export default function PreOrdersCrossSellBanner() {
  const [pending, start] = useTransition();

  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4">
      <p className="font-semibold">People are turning up to nothing?</p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Let them order ahead - pre-orders take a deposit or pay in full before
        collection day.
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <Link
          href="/dashboard/products/new"
          className="rounded-lg bg-[var(--leaf)] px-3 py-2 text-sm font-semibold text-white"
        >
          Set up a pre-order
        </Link>
        <button
          type="button"
          disabled={pending}
          onClick={() => start(async () => { await dismissPreOrdersCrossSell(); })}
          className="text-sm text-[var(--muted)] underline"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
