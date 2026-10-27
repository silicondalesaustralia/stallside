import Link from "next/link";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import DataTableRow from "@/components/dashboard/ui/DataTableRow";
import StatusPill, { type PillSpec } from "@/components/dashboard/ui/StatusPill";
import { formatMoney } from "@/lib/money";
import type { CollectionPageGroup } from "./group-collection-pages";
import { collectedCount } from "./load-collection-groups";

const COLUMNS: DataColumn[] = [
  { label: "Page" },
  { label: "Pick up / delivery", hideBelow: "sm" },
  { label: "Orders", align: "right" },
  { label: "Items", align: "right", hideBelow: "md" },
  { label: "Taken", align: "right", hideBelow: "md" },
  { label: "Handed over", hideBelow: "lg" },
  { label: "Status" },
];

const muted = "text-[var(--muted)]";

function statusPill(group: CollectionPageGroup): PillSpec {
  const collected = collectedCount(group);
  if (collected === group.orders.length) return { label: "All handed over", tone: "success" };
  if (group.windowClosed) return { label: "Date passed", tone: "attention" };
  return { label: "Upcoming", tone: "info" };
}

export function collectionHref(key: string) {
  return `/dashboard/collections/${encodeURIComponent(key)}`;
}

export default function CollectionsTable({ groups }: { groups: CollectionPageGroup[] }) {
  return (
    <DataTable columns={COLUMNS}>
      {groups.map((group) => {
        const href = collectionHref(group.key);
        return (
          <DataTableRow key={group.key} href={href}>
            <td className={`${cellClass(COLUMNS[0])} max-w-[260px] truncate font-semibold`}>
              <Link href={href} className="hover:underline">
                {group.title}
              </Link>
            </td>
            <td className={`${cellClass(COLUMNS[1])} whitespace-nowrap ${muted}`}>{group.collectionLabel}</td>
            <td className={`${cellClass(COLUMNS[2])} tabular-nums`}>{group.orders.length}</td>
            <td className={`${cellClass(COLUMNS[3])} tabular-nums ${muted}`}>{group.itemCount}</td>
            <td className={`${cellClass(COLUMNS[4])} font-receipt whitespace-nowrap`}>
              {formatMoney(group.takenCents, group.currency)}
            </td>
            <td className={`${cellClass(COLUMNS[5])} whitespace-nowrap ${muted}`}>
              {collectedCount(group)} of {group.orders.length}
            </td>
            <td className={cellClass(COLUMNS[6])}>
              <StatusPill {...statusPill(group)} />
            </td>
          </DataTableRow>
        );
      })}
    </DataTable>
  );
}
