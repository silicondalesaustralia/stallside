import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import NoBusinessYet from "@/components/NoBusinessYet";
import { loadUpsellFormOptions } from "@/lib/upsells/load";
import { EMPTY_DISCOUNT } from "@/lib/discounts/input";
import DiscountForm from "../DiscountForm";

export default async function NewDiscountPage() {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  const stand = selected
    ? await prisma.stand.findFirst({ where: { id: selected.id, ownerId: owner.id }, select: { id: true, currency: true } })
    : null;
  if (!stand) return <NoBusinessYet />;
  const options = await loadUpsellFormOptions(owner.id, stand.id);
  if (!options) return <NoBusinessYet />;
  const { categories, products } = options;

  return (
    <main className="flex max-w-2xl flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/discounts" className="underline">
            Discounts
          </Link>
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">New discount</h1>
      </div>
      <DiscountForm
        discountId={null}
        initial={EMPTY_DISCOUNT}
        categories={categories}
        products={products}
        currency={stand.currency}
      />
    </main>
  );
}
