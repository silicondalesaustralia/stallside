import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { loadUpsellFormOptions } from "../load-upsell-form";
import UpsellForm from "../UpsellForm";

export default async function EditUpsellPage({ params }: { params: Promise<{ upsellId: string }> }) {
  const { upsellId } = await params;
  const { owner } = await requireOwner();
  const upsell = await prisma.upsell.findFirst({
    where: { id: upsellId, ownerId: owner.id },
    include: { stand: { select: { currency: true } } },
  });
  if (!upsell) notFound();
  const options = await loadUpsellFormOptions(owner.id, upsell.standId, upsell.stand.currency);

  return (
    <main className="flex max-w-2xl flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/upsells" className="underline">
            Upsells &amp; offers
          </Link>
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">{upsell.name}</h1>
      </div>
      <UpsellForm
        upsellId={upsell.id}
        initial={{
          name: upsell.name,
          offerProductId: upsell.offerProductId,
          price: upsell.priceCents != null ? (upsell.priceCents / 100).toFixed(2) : "",
          isActive: upsell.isActive,
          sitewide: upsell.sitewide,
          categoryIds: upsell.categoryIds,
          productIds: upsell.productIds,
          showOnWebsite: upsell.showOnWebsite,
          showAtStall: upsell.showAtStall,
        }}
        currency={upsell.stand.currency}
        {...options}
      />
    </main>
  );
}
