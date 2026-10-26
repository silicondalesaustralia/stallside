import Link from "next/link";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";

export type StandingListRow = {
  id: string;
  name: string;
  description: string | null;
  count: number;
};

const COLUMNS: DataColumn[] = [
  { label: "List" },
  { label: "Contacts", align: "right" },
  { label: "", align: "right" },
];

export default function StandingListsTable({ lists }: { lists: StandingListRow[] }) {
  return (
    <DataTable columns={COLUMNS}>
      {lists.map((list) => (
        <tr key={list.id} className="align-middle">
          <td className={`${cellClass(COLUMNS[0])} max-w-[320px]`}>
            <p className="truncate font-semibold">{list.name}</p>
            {list.description ? (
              <p className="truncate text-xs text-[var(--muted)]">{list.description}</p>
            ) : null}
          </td>
          <td className={`${cellClass(COLUMNS[1])} font-receipt whitespace-nowrap`}>{list.count}</td>
          <td className={cellClass(COLUMNS[2])}>
            <Link
              href={`/dashboard/communication/new?listId=${list.id}`}
              prefetch={false}
              className="whitespace-nowrap font-semibold text-[var(--leaf-dark)] hover:underline"
            >
              Broadcast
            </Link>
          </td>
        </tr>
      ))}
    </DataTable>
  );
}
