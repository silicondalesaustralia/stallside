"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { selectBusiness } from "@/app/dashboard/select-business-action";
import type { BusinessOption } from "@/lib/selected-business";

export default function DashboardBusinessSelect({
  businesses,
  selectedId,
}: {
  businesses: BusinessOption[];
  selectedId: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (businesses.length === 0) {
    return (
      <Link
        href="/dashboard/businesses/new"
        className="text-sm font-medium text-[var(--leaf-dark)] underline"
      >
        Create a business
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <label className="flex items-center gap-2">
        <span className="font-medium text-[var(--ink)]">My Businesses</span>
        <select
          value={selectedId ?? businesses[0].id}
          disabled={pending}
          onChange={(e) => {
            const id = e.target.value;
            startTransition(async () => {
              const result = await selectBusiness(id);
              if (result && "error" in result) return;
              router.refresh();
            });
          }}
          className="max-w-[14rem] rounded-lg border border-[var(--line)] bg-white px-2 py-1.5 text-sm"
        >
          {businesses.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </label>
      <Link
        href={
          selectedId
            ? `/dashboard/businesses/${selectedId}`
            : "/dashboard/businesses"
        }
        className="text-[var(--muted)] underline hover:text-[var(--ink)]"
      >
        Manage
      </Link>
    </div>
  );
}
