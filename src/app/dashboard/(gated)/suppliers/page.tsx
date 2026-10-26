import { requireOwner } from "@/lib/session";
import { listOwnerSuppliers } from "@/lib/suppliers/members";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import NoBusinessYet from "@/components/NoBusinessYet";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import InviteForm from "./InviteForm";
import SuppliersTable from "./SuppliersTable";

export default async function SuppliersPage() {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  if (!selected) {
    return (
      <main className="flex flex-col gap-6">
        <PageHeader title="Suppliers" />
        <NoBusinessYet />
      </main>
    );
  }

  const members = await listOwnerSuppliers(owner.id, selected.id);

  return (
    <main className="flex flex-col gap-5">
      <PageHeader
        title="Suppliers"
        subtitle={`People who can add their own products and stock to ${selected.name}. You set the price and pay them outside Vendl.`}
      />
      {members.length === 0 ? (
        <div className="dash-card px-4 py-10 text-center text-sm text-[var(--muted)]">
          No suppliers yet. Invite one below.
        </div>
      ) : (
        <SuppliersTable members={members} />
      )}
      <InviteForm />
    </main>
  );
}
