import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import NoBusinessYet from "@/components/NoBusinessYet";
import DashPrimaryCta from "@/components/DashPrimaryCta";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import DiscountsTable from "./DiscountsTable";
import { loadDiscountRows } from "@/lib/discounts/load";

export default async function DiscountsPage() {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  const stand = selected
    ? await prisma.stand.findFirst({
        where: { id: selected.id, ownerId: owner.id },
        select: { id: true, name: true, currency: true },
      })
    : null;

  if (!stand) {
    return (
      <main className="flex flex-col gap-6">
        <PageHeader title="Discounts" />
        <NoBusinessYet />
      </main>
    );
  }

  const discounts = await loadDiscountRows(owner.id, stand.id, stand.currency);

  return (
    <main className="flex flex-col gap-5">
      <PageHeader
        title="Discounts"
        subtitle={`Codes shoppers type at checkout for money off or free shipping, online and at the stall · ${stand.name}`}
        actions={<DashPrimaryCta href="/dashboard/discounts/new">+ New discount</DashPrimaryCta>}
      />
      {discounts.length === 0 ? (
        <div className="dash-card px-4 py-10 text-center text-sm text-[var(--muted)]">No discount codes yet.</div>
      ) : (
        <DiscountsTable discounts={discounts} />
      )}
    </main>
  );
}
