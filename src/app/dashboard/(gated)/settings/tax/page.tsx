import { requireOwner } from "@/lib/session";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import DetailCard from "@/components/dashboard/ui/DetailCard";
import { loadOwnerTaxSettings } from "@/lib/tax/owner-tax-settings";
import TaxSettingsForm from "../TaxSettingsForm";
import GstSyncButton from "../GstSyncButton";
import TaxFreeProductsCard from "./TaxFreeProductsCard";

export default async function TaxSettingsPage() {
  const { owner: sessionOwner } = await requireOwner();
  const { owner, country, region, status } = await loadOwnerTaxSettings(sessionOwner.id);

  return (
    <main className="flex w-full max-w-3xl flex-col gap-5">
      <PageHeader
        title="Tax"
        subtitle="GST, VAT or sales tax for all your businesses. Orders, receipts, exports, profit and invoice scanning use this."
      />

      <DetailCard title={`${region.name} settings`}>
        <p className="mb-3 text-sm font-medium">{status}</p>
        <TaxSettingsForm
          country={country}
          rateBps={owner.taxRateBps}
          taxId={owner.abn}
          registered={owner.gstRegistered}
          taxShipping={owner.taxShipping}
        />
      </DetailCard>

      <TaxFreeProductsCard ownerId={sessionOwner.id} taxName={region.name} />

      <DetailCard title="Subscriptions and memberships">
        <p className="text-sm text-[var(--muted)]">
          {region.inclusive
            ? `Subscription and membership prices include ${region.name}. Vendl records the ${region.name} inside each renewal.`
            : `Renewals charge the price you set, so include ${region.name.toLowerCase()} in subscription and membership prices. Vendl does not add it on top of recurring charges.`}
        </p>
      </DetailCard>

      {region.inclusive ? (
        <DetailCard title="Past orders">
          <p className="mb-3 text-sm text-[var(--muted)]">
            Changed your registration or tax-free products? Recalculate the {region.name} on orders you have
            already taken.
          </p>
          <GstSyncButton />
        </DetailCard>
      ) : null}
    </main>
  );
}
