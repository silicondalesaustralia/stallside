"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export type DemoHubTab = "website" | "checkout";

export default function DemoHubTabs({
  active,
  children,
}: {
  active: DemoHubTab;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div>
      <div
        role="tablist"
        aria-label="Demo products"
        className="flex gap-1 rounded-full border border-[var(--line)] bg-white p-1"
      >
        {(
          [
            { id: "website", label: "Website demo" },
            { id: "checkout", label: "Farmstand checkout" },
          ] as const
        ).map((tab) => {
          const selected = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() =>
                router.push(tab.id === "website" ? "/demo" : "/demo?tab=checkout")
              }
              className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition ${
                selected
                  ? "bg-[var(--field)] text-white"
                  : "text-[var(--muted)] hover:text-[var(--field)]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="mt-8" role="tabpanel">
        {children}
      </div>
      <p className="mt-10 text-center text-sm text-[var(--muted)]">
        <Link href="/" className="underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
