import { requireOwner } from "@/lib/session";
import NoBusinessYet from "@/components/NoBusinessYet";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import CollectionsTable from "./CollectionsTable";
import { loadCollectionGroups } from "./load-collection-groups";

export default async function CollectionsPage() {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);

  if (!selected) {
    return (
      <main className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Pick Ups &amp; Delivery</h1>
        </div>
        <NoBusinessYet />
      </main>
    );
  }

  const { groups } = await loadCollectionGroups(owner.id, selected);

  return (
    <main className="flex flex-col gap-5">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          Pick Ups &amp; Delivery
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          {groups.length} page{groups.length === 1 ? "" : "s"} in progress · {selected.name}. Open one for the make
          list, packing list and printing.
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="text-[var(--muted)]">No paid pre-orders or subscription cycles upcoming or in the last 14 days.</p>
      ) : (
        <CollectionsTable groups={groups} />
      )}
    </main>
  );
}
