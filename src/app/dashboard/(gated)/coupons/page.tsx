import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import DashPrimaryCta from "@/components/DashPrimaryCta";
import { formatMoney } from "@/lib/money";
import { archivePromotion } from "./actions";

export default async function CouponsPage() {
  const { owner } = await requireOwner();
  const currency = owner.billingCurrency || "AUD";

  const promotions = await prisma.promotion.findMany({
    where: { ownerId: owner.id },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--muted)]">
            <Link href="/dashboard/marketing" className="underline">
              Grow
            </Link>
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Coupons
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            Discount codes for checkout and campaigns.
          </p>
        </div>
        <DashPrimaryCta href="/dashboard/coupons/new">+ New coupon</DashPrimaryCta>
      </div>

      {promotions.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No coupons yet. Create a code for first orders or a weekend special.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {promotions.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm"
            >
              <div>
                <p className="font-medium">
                  {p.code}
                  {!p.isActive ? (
                    <span className="ml-2 text-[var(--muted)]">(archived)</span>
                  ) : null}
                </p>
                <p className="mt-1 text-[var(--muted)]">
                  {p.name} ·{" "}
                  {p.type === "PERCENT_OFF"
                    ? `${p.percentOff ?? 0}% off`
                    : formatMoney(p.amountOffCents ?? 0, currency)}
                  {p.minOrderCents > 0
                    ? ` · min ${formatMoney(p.minOrderCents, currency)}`
                    : ""}
                  {p.firstOrderOnly ? " · first order" : ""}
                  {" · "}
                  used {p.usageCount}
                  {p.usageLimit != null ? ` / ${p.usageLimit}` : ""}
                </p>
              </div>
              {p.isActive ? (
                <form action={archivePromotion}>
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" className="text-[var(--muted)] underline">
                    Archive
                  </button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
