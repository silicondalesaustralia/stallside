import Link from "next/link";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import { archiveList } from "./actions";

export type CustomerListRow = {
  id: string;
  name: string;
  summary: string;
  count: number;
};

const COLUMNS: DataColumn[] = [
  { label: "List" },
  { label: "Contacts", align: "right" },
  { label: "", align: "right" },
];

export default function CustomerListsTable({ lists }: { lists: CustomerListRow[] }) {
  return (
    <DataTable columns={COLUMNS} footer={`${lists.length} list${lists.length === 1 ? "" : "s"}`}>
      {lists.map((list) => (
        <tr key={list.id} className="align-middle">
          <td className={`${cellClass(COLUMNS[0])} max-w-[320px]`}>
            <p className="truncate font-semibold">{list.name}</p>
            <p className="truncate text-xs text-[var(--muted)]">{list.summary}</p>
          </td>
          <td className={`${cellClass(COLUMNS[1])} font-receipt whitespace-nowrap`}>{list.count}</td>
          <td className={cellClass(COLUMNS[2])}>
            <div className="flex items-center justify-end gap-3 whitespace-nowrap">
              <Link
                href={`/dashboard/communication/new?listId=${list.id}`}
                prefetch={false}
                className="font-semibold text-[var(--leaf-dark)] hover:underline"
              >
                Email
              </Link>
              <form action={archiveList}>
                <input type="hidden" name="id" value={list.id} />
                <button type="submit" className="text-[var(--muted)] hover:underline">
                  Archive
                </button>
              </form>
            </div>
          </td>
        </tr>
      ))}
    </DataTable>
  );
}
