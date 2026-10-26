import Link from "next/link";
import { requireOwner } from "@/lib/session";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { secondaryButtonClass } from "@/components/dashboard/ui/button-styles";
import DashPrimaryCta from "@/components/DashPrimaryCta";
import CustomersSearchForm from "./CustomersSearchForm";
import CustomersTable from "./CustomersTable";
import { listOwnerCustomers } from "@/lib/customers/service";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { owner } = await requireOwner();
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const customers = await listOwnerCustomers(owner.id, query);

  return (
    <main className="flex flex-col gap-5">
      <PageHeader
        title="Customers"
        subtitle="Built from order and subscription emails. Cash without email stays anonymous."
        actions={
          <>
            <Link href="/dashboard/customers/lists" className={secondaryButtonClass}>
              Lists
            </Link>
            <DashPrimaryCta href="/dashboard/communication/new">Send email</DashPrimaryCta>
          </>
        }
      />

      <CustomersSearchForm initialQuery={query} />

      {customers.length === 0 ? (
        <div className="dash-card px-4 py-10 text-center text-sm text-[var(--muted)]">
          {query
            ? "No customers match that search."
            : "No customers yet. They appear after a paid order with a receipt email."}
        </div>
      ) : (
        <CustomersTable customers={customers} />
      )}
    </main>
  );
}
