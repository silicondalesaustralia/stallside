"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { selectBusiness } from "@/app/dashboard/select-business-action";
import type { BusinessOption } from "@/lib/selected-business";

export default function DashboardBusinessSelect({
  businesses,
  selectedId,
  tone = "light",
  needsBusiness = false,
}: {
  businesses: BusinessOption[];
  selectedId: string | null;
  tone?: "light" | "dark";
  needsBusiness?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const dark = tone === "dark";

  if (businesses.length === 0) {
    return (
      <Link
        href="/dashboard/businesses/new"
        className={`relative inline-flex items-center gap-2 ${
          dark
            ? "text-sm font-medium text-[var(--marigold)] underline"
            : "text-sm font-medium text-[var(--leaf-dark)] underline"
        }`}
      >
        Create a business
        {needsBusiness ? (
          <span className="size-2 rounded-full bg-[var(--gone)]" />
        ) : null}
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-2 text-sm">
      <label className="flex flex-col gap-1">
        <span
          className={`text-[11px] font-bold uppercase tracking-[0.12em] ${
            dark ? "text-[var(--ink-on-dark)]/55" : "text-[var(--ink)]"
          }`}
        >
          Business
        </span>
        <select
          value={selectedId ?? businesses[0].id}
          disabled={pending}
          onChange={(e) => {
            const id = e.target.value;
            startTransition(async () => {
              const result = await selectBusiness(id, pathname);
              if (result && "error" in result) return;
              router.refresh();
            });
          }}
          className={
            dark
              ? "w-full rounded-lg border border-white/15 bg-white/10 px-2 py-1.5 text-sm text-[var(--ink-on-dark)]"
              : "rounded-lg border border-[var(--line)] bg-white px-2 py-1.5 text-sm"
          }
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
        className={
          dark
            ? "text-xs text-[var(--ink-on-dark)]/60 underline hover:text-[var(--ink-on-dark)]"
            : "text-[var(--muted)] underline hover:text-[var(--ink)]"
        }
      >
        Manage
      </Link>
    </div>
  );
}
