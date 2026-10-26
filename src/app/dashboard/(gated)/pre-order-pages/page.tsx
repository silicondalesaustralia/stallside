import { requireOwner } from "@/lib/session";
import { listOwnerPreOrderPages } from "@/lib/pre-order-pages/service";
import DashPrimaryCta from "@/components/DashPrimaryCta";
import NoBusinessYet from "@/components/NoBusinessYet";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { standPublicLinks } from "@/lib/storefront/stand-public-links";
import PreOrderPagesTable from "./PreOrderPagesTable";

export default async function PreOrderPagesListPage() {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);

  if (!selected) {
    return (
      <main className="flex flex-col gap-6">
        <PageHeader title="Pre-order pages" />
        <NoBusinessYet />
      </main>
    );
  }

  const [pages, links] = await Promise.all([
    listOwnerPreOrderPages(owner.id, selected.id),
    standPublicLinks(selected.slug),
  ]);

  return (
    <main className="flex flex-col gap-5">
      <PageHeader
        title="Pre-order pages"
        subtitle={`${selected.name} · one link with several products for the same collection day.`}
        actions={<DashPrimaryCta href="/dashboard/pre-order-pages/new">+ New pre-order page</DashPrimaryCta>}
      />

      {pages.length === 0 ? (
        <div className="dash-card px-4 py-10 text-center text-sm text-[var(--muted)]">
          No pre-order pages yet. Create one, pick products, share the link.
        </div>
      ) : (
        <PreOrderPagesTable
          pages={pages}
          publicUrl={Object.fromEntries(pages.map((p) => [p.id, links.preOrder(p.slug)]))}
        />
      )}
    </main>
  );
}
