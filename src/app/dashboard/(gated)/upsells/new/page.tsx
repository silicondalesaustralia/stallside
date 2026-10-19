import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import NoBusinessYet from "@/components/NoBusinessYet";
import { loadUpsellFormOptions } from "@/lib/upsells/load";
import UpsellForm from "../UpsellForm";

export default async function NewUpsellPage({ searchParams }: { searchParams: Promise<{ category?: string; product?: string }> }) {
  const { owner } = await requireOwner();
  const { category, product } = await searchParams;
  const { selected } = await resolveSelectedBusiness(owner.id);
  const options = selected ? await loadUpsellFormOptions(owner.id, selected.id) : null;
  if (!options) return <NoBusinessYet />;
  const categoryIds = category && options.categories.some((c) => c.id === category) ? [category] : [];
  const productIds = product && options.products.some((p) => p.id === product) ? [product] : [];

  return (
    <main className="flex max-w-2xl flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/upsells" className="underline">
            Upsells &amp; offers
          </Link>
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">New upsell</h1>
      </div>
      <UpsellForm
        upsellId={null}
        initial={{
          name: "",
          offerProductId: "",
          price: "",
          isActive: true,
          sitewide: categoryIds.length === 0 && productIds.length === 0,
          categoryIds,
          productIds,
          showOnWebsite: true,
          showAtStall: true,
        }}
        {...options}
      />
    </main>
  );
}
