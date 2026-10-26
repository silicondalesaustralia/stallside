import Link from "next/link";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import DataTableRow from "@/components/dashboard/ui/DataTableRow";
import StatusPill from "@/components/dashboard/ui/StatusPill";
import { PAGE_STATUS_PILL, type PageStatus } from "./page-status";

export type PagesTableRow = {
  id: string;
  title: string;
  detail: string;
  type: "Home" | "Content" | "Policy";
  status: PageStatus;
  previewUrl: string;
  editHref: string;
  /** Omitted for pages that can't be switched off (the home page). */
  toggleAction?: () => Promise<void>;
};

const COLUMNS: DataColumn[] = [
  { label: "Page" },
  { label: "Type", hideBelow: "sm" },
  { label: "Status" },
  { label: "", align: "right", hideBelow: "sm" },
];

const ACTION = "font-semibold text-[var(--leaf-dark)] underline";

export default function PagesTable({ rows, footer }: { rows: PagesTableRow[]; footer: React.ReactNode }) {
  return (
    <DataTable columns={COLUMNS} footer={footer}>
      {rows.map((row) => {
        const pill = PAGE_STATUS_PILL[row.status];
        return (
          <DataTableRow key={row.id} href={row.editHref}>
            <td className={cellClass(COLUMNS[0])}>
              <Link href={row.editHref} prefetch={false} className="font-semibold hover:underline">
                {row.title}
              </Link>
              <p className="text-xs text-[var(--muted)]">{row.detail}</p>
            </td>
            <td className={`${cellClass(COLUMNS[1])} whitespace-nowrap text-[var(--muted)]`}>{row.type}</td>
            <td className={cellClass(COLUMNS[2])}>
              <span title={pill.title}>
                <StatusPill label={pill.label} tone={pill.tone} />
              </span>
            </td>
            <td className={cellClass(COLUMNS[3])}>
              <div className="flex items-center justify-end gap-3 whitespace-nowrap text-sm">
                <a href={row.previewUrl} target="_blank" rel="noreferrer" className={ACTION}>
                  Preview
                </a>
                {row.toggleAction ? (
                  <form action={row.toggleAction}>
                    <button type="submit" className={ACTION}>
                      {row.status === "off" ? "Publish" : "Unpublish"}
                    </button>
                  </form>
                ) : null}
              </div>
            </td>
          </DataTableRow>
        );
      })}
    </DataTable>
  );
}
