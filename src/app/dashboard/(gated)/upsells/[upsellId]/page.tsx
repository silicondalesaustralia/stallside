import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { getOwnerUpsell, loadUpsellFormOptions } from "@/lib/upsells/load";
import UpsellForm from "../UpsellForm";

export default async function EditUpsellPage({ params }: { params: Promise<{ upsellId: string }> }) {
  const { upsellId } = await params;
  const { owner } = await requireOwner();
  const upsell = await getOwnerUpsell(owner.id, upsellId);
  if (!upsell) notFound();
  const options = await loadUpsellFormOptions(owner.id, upsell.standId);
  if (!options) notFound();

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
      <UpsellForm upsellId={upsell.id} initial={upsell.input} {...options} />
    </main>
  );
}
