import Link from "next/link";
import DashPrimaryCta from "@/components/DashPrimaryCta";
import type { DiscountRow } from "@/lib/discounts/load";

export default function DiscountList({ discounts }: { discounts: DiscountRow[] }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Discount codes</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Shoppers type a code at checkout to get money off or free shipping.
          </p>
        </div>
        <DashPrimaryCta href="/dashboard/discounts/new">+ New discount</DashPrimaryCta>
      </div>
      {discounts.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No discount codes yet.</p>
      ) : (
        <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)] text-sm">
          {discounts.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-medium">
                  <span className="font-mono">{d.code}</span>
                  {d.name ? <span className="ml-2 font-normal text-[var(--muted)]">{d.name}</span> : null}
                  {d.status ? (
                    <span className="ml-2 rounded-full bg-[var(--wash)] px-2 py-0.5 text-xs font-medium">
                      {d.status}
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-[var(--muted)]">
                  {d.summary} · {d.uses}
                </p>
              </div>
              <Link href={`/dashboard/discounts/${d.id}`} className="text-[var(--leaf-dark)] underline">
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
