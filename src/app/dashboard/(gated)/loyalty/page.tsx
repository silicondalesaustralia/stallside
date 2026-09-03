import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { saveLoyaltyProgram } from "./actions";

export default async function LoyaltyPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { owner } = await requireOwner();
  const { saved } = await searchParams;
  const currency = owner.billingCurrency || "AUD";
  const program = await prisma.loyaltyProgram.findUnique({
    where: { ownerId: owner.id },
  });

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/marketing" className="underline">
            Grow
          </Link>
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Loyalty</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Reward repeat customers with points toward a discount.
        </p>
      </div>

      {saved ? (
        <p className="text-sm text-[var(--leaf-dark)]">Loyalty settings saved.</p>
      ) : null}

      <form
        action={saveLoyaltyProgram}
        className="dash-card flex flex-col gap-4 p-5"
      >
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={program?.isActive ?? false}
          />
          Enable loyalty program
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Program name</span>
          <input
            name="name"
            defaultValue={program?.name ?? "Rewards"}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Points per $1 spent</span>
          <input
            name="pointsPerCurrency"
            type="number"
            min={1}
            defaultValue={program?.pointsPerCurrency ?? 1}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Points for a reward</span>
          <input
            name="rewardThreshold"
            type="number"
            min={1}
            defaultValue={program?.rewardThreshold ?? 100}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Reward value ($)</span>
          <input
            name="rewardAmount"
            type="number"
            min={0}
            step="0.01"
            defaultValue={
              program
                ? (program.rewardCents / 100).toFixed(2)
                : "10.00"
            }
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
          <span className="text-xs text-[var(--muted)]">
            Current reward:{" "}
            {formatMoney(program?.rewardCents ?? 1000, currency)}
          </span>
        </label>
        <button type="submit" className={dashCtaClass}>
          Save
        </button>
      </form>
    </main>
  );
}
