import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  countSegmentAudience,
  describeSegmentRules,
  parseSegmentRules,
} from "@/lib/crm/segments";
import { STANDING_LIST_PRESET_KEYS } from "@/lib/crm/segment-rules";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { secondaryButtonClass } from "@/components/dashboard/ui/button-styles";
import DashPrimaryCta from "@/components/DashPrimaryCta";
import CustomerListsTable from "./CustomerListsTable";

export default async function CustomerListsPage() {
  const { owner } = await requireOwner();

  const lists = await prisma.customerSegment.findMany({
    where: {
      ownerId: owner.id,
      isActive: true,
      NOT: { presetKey: { in: [...STANDING_LIST_PRESET_KEYS] } },
    },
    orderBy: { createdAt: "desc" },
  });

  const counts = await Promise.all(
    lists.map(async (list) => ({
      id: list.id,
      count: await countSegmentAudience(
        owner.id,
        parseSegmentRules(list.rules),
      ),
      summary: describeSegmentRules(parseSegmentRules(list.rules)),
    })),
  );
  const byId = Object.fromEntries(counts.map((c) => [c.id, c]));

  return (
    <main className="flex flex-col gap-5">
      <PageHeader
        title="Lists"
        backHref="/dashboard/customers"
        backLabel="Customers"
        subtitle="Group customers by purchases, pre-orders, or a CSV upload — then email them from Communication. Restock opt-ins live under Communication."
        actions={
          <>
            <Link href="/dashboard/customers/lists/new" className={secondaryButtonClass}>
              From rules
            </Link>
            <DashPrimaryCta href="/dashboard/customers/lists/upload">Upload CSV</DashPrimaryCta>
          </>
        }
      />

      {lists.length === 0 ? (
        <div className="dash-card px-4 py-10 text-center text-sm text-[var(--muted)]">
          No lists yet. Create one from product / pre-order rules, or upload a
          CSV of emails.
        </div>
      ) : (
        <CustomerListsTable
          lists={lists.map((list) => ({
            id: list.id,
            name: list.name,
            summary: byId[list.id]?.summary ?? "",
            count: byId[list.id]?.count ?? 0,
          }))}
        />
      )}
    </main>
  );
}
