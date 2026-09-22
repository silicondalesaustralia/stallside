"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function CustomersSearchForm({
  initialQuery,
}: {
  initialQuery: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-wrap gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const next = q.trim();
        startTransition(() => {
          router.push(
            next
              ? `/dashboard/customers?q=${encodeURIComponent(next)}`
              : "/dashboard/customers",
          );
        });
      }}
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name, email, or phone"
        className="min-w-[16rem] flex-1 rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
