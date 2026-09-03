import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import NoBusinessYet from "@/components/NoBusinessYet";
import { formatMoney } from "@/lib/money";
import { buildProductionGroups } from "@/lib/production/aggregate";
import { formatQuantity } from "@/lib/production/units";
import { saveProductionPlan } from "../recipes/actions";
import { dashCtaClass } from "@/components/DashPrimaryCta";

export default async function ProductionPage({
  searchParams,
}: {
  searchParams: Promise<{
    range?: string;
    menuId?: string;
    saved?: string;
    key?: string;
    print?: string;
  }>;
}) {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  if (!selected) {
    return (
      <main className="flex flex-col gap-8">
        <h1 className="text-3xl font-semibold tracking-tight">Production</h1>
        <NoBusinessYet />
      </main>
    );
  }

  const sp = await searchParams;
  const range = sp.range === "today" || sp.range === "tomorrow" ? sp.range : "week";
  const standMeta = await prisma.stand.findFirst({
    where: { id: selected.id, ownerId: owner.id },
    select: { timezone: true },
  });
  const tz = standMeta?.timezone || owner.defaultTimezone || "Australia/Adelaide";

  const from = new Date();
  from.setHours(0, 0, 0, 0);
  if (range === "tomorrow") from.setDate(from.getDate() + 1);
  const to = new Date(from);
  if (range === "week") to.setDate(to.getDate() + 14);
  else to.setDate(to.getDate() + 1);

  const packView =
    range === "today" || range === "tomorrow" ? range : "today";

  const [groups, menus, plans] = await Promise.all([
    buildProductionGroups({
      ownerId: owner.id,
      standId: selected.id,
      from,
      to,
      timeZone: tz,
      menuId: sp.menuId || null,
    }),
    prisma.menu.findMany({
      where: {
        ownerId: owner.id,
        standId: selected.id,
        kind: "PREORDER_DROP",
        isActive: true,
      },
      orderBy: { collectionAt: "asc" },
      select: { id: true, title: true, collectionAt: true },
    }),
    prisma.productionPlan.findMany({
      where: { ownerId: owner.id, standId: selected.id },
    }),
  ]);

  const planByKey = new Map(plans.map((p) => [p.groupKey, p]));
  const printMode = sp.print === "1";

  return (
    <main className={`flex flex-col gap-8 ${printMode ? "print-production" : ""}`}>
      <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Production</h1>
          <p className="mt-1 text-[var(--muted)]">
            Quantities from paid orders — recipes add ingredient & cost estimates.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/dashboard/production?range=today" className="underline">
            Today
          </Link>
          <Link href="/dashboard/production?range=tomorrow" className="underline">
            Tomorrow
          </Link>
          <Link href="/dashboard/production?range=week" className="underline">
            Next 14 days
          </Link>
          <Link
            href={`/dashboard/production?range=${range}${sp.menuId ? `&menuId=${sp.menuId}` : ""}&print=1`}
            className="font-semibold text-[var(--leaf-dark)] underline"
          >
            Print view
          </Link>
          <Link
            href={`/dashboard/fulfilment/orders?view=${packView}`}
            className="font-semibold text-[var(--leaf-dark)] underline"
          >
            Pack orders
          </Link>
          <Link
            href="/dashboard/calendar"
            className="font-semibold text-[var(--leaf-dark)] underline"
          >
            View in calendar
          </Link>
        </div>
      </div>

      {printMode ? (
        <p className="hidden print:block text-sm">
          {owner.businessName} · Production sheet
        </p>
      ) : null}

      <form method="get" className="flex flex-wrap gap-3 print:hidden">
        <input type="hidden" name="range" value={range} />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Menu / drop (optional)</span>
          <select
            name="menuId"
            defaultValue={sp.menuId ?? ""}
            className="rounded-lg border border-[var(--line)] px-3 py-2"
          >
            <option value="">All orders</option>
            {menus.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={`${dashCtaClass} self-end`}>
          Apply
        </button>
      </form>

      {sp.saved ? (
        <p className="text-sm text-[var(--leaf-dark)] print:hidden">Saved.</p>
      ) : null}

      {groups.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No paid orders in this range. Production lists fill from real orders
          (same payment rules as Collections). Link recipes on products to see
          ingredient requirements.
        </p>
      ) : (
        groups.map((g) => {
          const plan = planByKey.get(g.groupKey);
          return (
            <section
              key={g.groupKey}
              className="dash-card flex flex-col gap-4 p-5 break-inside-avoid"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">{g.title}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {g.orderCount} orders · Revenue{" "}
                    {formatMoney(g.revenueCents, g.currency)}
                    {g.ingredientCostCents > 0
                      ? ` · Est. ingredient cost ${formatMoney(g.ingredientCostCents, g.currency)} · Contribution before other costs ${formatMoney(g.contributionCents, g.currency)}`
                      : ""}
                  </p>
                  {plan?.status ? (
                    <p className="mt-1 text-xs uppercase tracking-wide text-[var(--muted)]">
                      {plan.status.replace("_", " ")}
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold">Make</h3>
                <ul className="mt-2 space-y-2 text-sm">
                  {g.products.map((p) => (
                    <li
                      key={p.productId}
                      className="flex flex-wrap justify-between gap-2 border-b border-[var(--line)] py-2"
                    >
                      <span>
                        <strong>{p.quantity}</strong> × {p.name}
                        {p.suggestedBatches != null && p.exactBatches != null ? (
                          <span className="text-[var(--muted)]">
                            {" "}
                            · {formatQuantity(p.exactBatches, 2)} batches
                            {p.suggestedBatches > p.exactBatches
                              ? ` → make ${p.suggestedBatches} (${p.suggestedOutput} ${p.yieldLabel})`
                              : ""}
                          </span>
                        ) : (
                          <span className="text-[var(--muted)]">
                            {" "}
                            · no recipe linked
                          </span>
                        )}
                      </span>
                      <span className="text-[var(--muted)]">
                        {formatMoney(p.revenueCents, g.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {g.ingredients.length > 0 ? (
                <div>
                  <h3 className="text-sm font-semibold">Ingredients required</h3>
                  <ul className="mt-2 space-y-1 text-sm">
                    {g.ingredients.map((ing) => (
                      <li key={ing.key}>
                        {formatQuantity(ing.quantity)} {ing.unitDisplay} {ing.name}
                        <span className="text-[var(--muted)]">
                          {" "}
                          · ~{formatMoney(ing.costCents, g.currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <form
                action={saveProductionPlan}
                className="mt-2 flex flex-col gap-2 print:hidden"
              >
                <input type="hidden" name="standId" value={selected.id} />
                <input type="hidden" name="groupKey" value={g.groupKey} />
                <input type="hidden" name="title" value={g.title} />
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium">Status</span>
                  <select
                    name="status"
                    defaultValue={plan?.status ?? "PLANNED"}
                    className="rounded-lg border border-[var(--line)] px-3 py-2"
                  >
                    <option value="PLANNED">Planned</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="COMPLETE">Complete</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium">Notes</span>
                  <textarea
                    name="notes"
                    rows={2}
                    defaultValue={plan?.notes ?? ""}
                    placeholder="Start dough Friday 6pm…"
                    className="rounded-lg border border-[var(--line)] px-3 py-2"
                  />
                </label>
                <button type="submit" className={`${dashCtaClass} self-start`}>
                  Save notes
                </button>
              </form>
              {plan?.notes && printMode ? (
                <p className="text-sm">Notes: {plan.notes}</p>
              ) : null}
            </section>
          );
        })
      )}
    </main>
  );
}
