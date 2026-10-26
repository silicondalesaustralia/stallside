import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import StatusPill from "@/components/dashboard/ui/StatusPill";
import type { StorefrontRedirect } from "@/lib/studio/redirects";
import { deleteStorefrontRedirect, toggleStorefrontRedirect } from "./actions";

const COLUMNS: DataColumn[] = [
  { label: "From" },
  { label: "To" },
  { label: "Type", hideBelow: "md" },
  { label: "Status" },
  { label: "Live site", hideBelow: "sm" },
  { label: "", align: "right" },
];

const muted = "text-[var(--muted)]";

function isLive(r: StorefrontRedirect, published: StorefrontRedirect[]) {
  return published.some(
    (p) => p.fromPath === r.fromPath && p.toPath === r.toPath && p.enabled === r.enabled && p.code === r.code,
  );
}

export default function RedirectsTable({
  redirects,
  published,
}: {
  redirects: StorefrontRedirect[];
  published: StorefrontRedirect[];
}) {
  return (
    <DataTable
      columns={COLUMNS}
      footer={`${redirects.length} draft redirect${redirects.length === 1 ? "" : "s"}`}
    >
      {redirects.map((r) => (
        <tr key={r.id} className="align-middle">
          <td className={`${cellClass(COLUMNS[0])} max-w-[220px] truncate font-mono text-xs`}>{r.fromPath}</td>
          <td className={`${cellClass(COLUMNS[1])} max-w-[220px] truncate font-mono text-xs`}>{r.toPath}</td>
          <td className={`${cellClass(COLUMNS[2])} whitespace-nowrap ${muted}`}>
            {r.code === 301 ? "Permanent (301)" : "Temporary (302)"}
          </td>
          <td className={cellClass(COLUMNS[3])}>
            {r.enabled ? <StatusPill label="Enabled" tone="success" /> : <StatusPill label="Disabled" tone="neutral" />}
          </td>
          <td className={`${cellClass(COLUMNS[4])} whitespace-nowrap ${muted}`}>
            {isLive(r, published) ? "Live" : "Draft only"}
          </td>
          <td className={cellClass(COLUMNS[5])}>
            <div className="flex items-center justify-end gap-3 whitespace-nowrap text-sm">
              <form action={toggleStorefrontRedirect}>
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" className="font-semibold text-[var(--leaf-dark)] underline">
                  {r.enabled ? "Disable" : "Enable"}
                </button>
              </form>
              <form action={deleteStorefrontRedirect}>
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" className="font-semibold text-[var(--gone)] underline">
                  Delete
                </button>
              </form>
            </div>
          </td>
        </tr>
      ))}
    </DataTable>
  );
}
