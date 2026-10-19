import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import NoBusinessYet from "@/components/NoBusinessYet";
import DiscountList from "./DiscountList";
import { loadDiscountRows } from "./load-discounts";

export default async function DiscountsPage() {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  const stand = selected
    ? await prisma.stand.findFirst({
        where: { id: selected.id, ownerId: owner.id },
        select: { id: true, name: true, currency: true },
      })
    : null;

  return (
    <main className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">Discounts</h1>
        {stand ? (
          <p className="mt-1 text-sm text-[var(--muted)]">
            Discount codes for {stand.name}, on your online store and stall checkout.
          </p>
        ) : null}
      </div>
      {stand ? (
        <DiscountList discounts={await loadDiscountRows(owner.id, stand.id, stand.currency)} />
      ) : (
        <NoBusinessYet />
      )}
    </main>
  );
}
