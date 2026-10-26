export type DataColumn = {
  label: string;
  align?: "left" | "right";
  /** Hide below this breakpoint so phones keep the key columns. */
  hideBelow?: "sm" | "md" | "lg";
  className?: string;
};

const HIDE: Record<NonNullable<DataColumn["hideBelow"]>, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
};

export function cellClass(column: Pick<DataColumn, "align" | "hideBelow" | "className">) {
  return [
    "px-3 py-2.5 first:pl-4 last:pr-4",
    column.align === "right" ? "text-right" : "text-left",
    column.hideBelow ? HIDE[column.hideBelow] : "",
    column.className ?? "",
  ].join(" ");
}

/** Compact dashboard list table (orders, products, …). Rows come from the caller. */
export default function DataTable({
  columns,
  children,
  footer,
}: {
  columns: DataColumn[];
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="dash-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] bg-[var(--wash)]/60 text-xs font-semibold text-[var(--muted)]">
              {columns.map((column) => (
                <th key={column.label} scope="col" className={`${cellClass(column)} whitespace-nowrap font-semibold`}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">{children}</tbody>
        </table>
      </div>
      {footer ? (
        <div className="border-t border-[var(--line)] px-4 py-2.5 text-xs text-[var(--muted)]">{footer}</div>
      ) : null}
    </div>
  );
}
