import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import NoBusinessYet from "@/components/NoBusinessYet";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import MenuForm from "../MenuForm";

export default async function NewMenuPage() {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);

  if (!selected) {
    return (
      <main className="flex flex-col gap-8">
        <h1 className="text-3xl font-semibold tracking-tight">New menu</h1>
        <NoBusinessYet />
      </main>
    );
  }

  const stand = await prisma.stand.findFirst({
    where: { id: selected.id, ownerId: owner.id },
    select: { currency: true, timezone: true },
  });
  if (!stand) {
    return (
      <main className="flex flex-col gap-8">
        <h1 className="text-3xl font-semibold tracking-tight">New menu</h1>
        <NoBusinessYet />
      </main>
    );
  }

  const products = await prisma.product.findMany({
    where: {
      standId: selected.id,
      ownerId: owner.id,
      isArchived: false,
      isHidden: false,
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, priceCents: true },
  });

  return (
    <main className="flex flex-col gap-6">
      <p className="text-sm text-[var(--muted)]">
        <Link href="/dashboard/menus" className="underline">
          Menus
        </Link>
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">New menu</h1>
      <MenuForm
        products={products}
        stripeConnected={Boolean(
          owner.stripeAccountId && owner.stripeChargesEnabled,
        )}
        currency={stand.currency}
        timeZone={stand.timezone}
      />
    </main>
  );
}
