import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { loadUpsellFormOptions } from "../../upsells/load-upsell-form";
import { discountToInput } from "../load-discounts";
import DiscountForm from "../DiscountForm";

export default async function EditDiscountPage({ params }: { params: Promise<{ discountId: string }> }) {
  const { discountId } = await params;
  const { owner } = await requireOwner();
  const promo = await prisma.promotion.findFirst({ where: { id: discountId, ownerId: owner.id } });
  if (!promo) notFound();
  const standId = promo.standId ?? (await resolveSelectedBusiness(owner.id)).selected?.id;
  const stand = standId
    ? await prisma.stand.findFirst({
        where: { id: standId, ownerId: owner.id },
        select: { id: true, currency: true, timezone: true },
      })
    : null;
  if (!stand) notFound();
  const { categories, products } = await loadUpsellFormOptions(owner.id, stand.id, stand.currency);

  return (
    <main className="flex max-w-2xl flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/discounts" className="underline">
            Discounts
          </Link>
        </p>
        <h1 className="mt-1 font-mono text-3xl font-bold tracking-tight">{promo.code}</h1>
      </div>
      <DiscountForm
        discountId={promo.id}
        initial={discountToInput(promo, stand.timezone || "Australia/Sydney")}
        categories={categories}
        products={products}
        currency={stand.currency}
      />
    </main>
  );
}
