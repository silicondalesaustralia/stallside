import type { ReactNode } from "react";
import { renderInlineMarkdown } from "@/components/news-inline-markdown";

export function newsTableClass(prevHeading: string) {
  if (prevHeading === "Direct Pricing Comparison") return "pricing-comparison";
  if (prevHeading === "Head-to-Head Feature Matrix") return "feature-matrix";
  return undefined;
}

export function parseMarkdownTable(rows: string[]) {
  return rows
    .filter((row) => !/^\|[\s-|:]+\|$/.test(row.trim()))
    .map((row) =>
      row
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim()),
    );
}

export function NewsMarkdownTable({
  rows,
  className,
}: {
  rows: string[][];
  className?: string;
}) {
  if (rows.length === 0) return null;
  const [header, ...body] = rows;
  return (
    <div className={`my-6 overflow-x-auto ${className ?? ""}`}>
      <table className="w-full min-w-[36rem] border-collapse text-left text-sm sm:text-base">
        <thead>
          <tr className="border-b border-[var(--line)]">
            {header.map((cell) => (
              <th
                key={cell}
                className="px-2 py-2 font-[family-name:var(--font-display)] font-bold text-[var(--field)]"
              >
                {renderInlineMarkdown(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row) => (
            <tr key={row.join("|")} className="border-b border-[var(--line)]/60">
              {row.map((cell, idx) => (
                <td
                  key={`${idx}-${cell}`}
                  className="px-2 py-2 align-top text-[var(--ink)]"
                >
                  {renderInlineMarkdown(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function NewsMarkdownList({
  items,
  ordered,
}: {
  items: string[];
  ordered: boolean;
}) {
  const ListTag = ordered ? "ol" : "ul";
  return (
    <ListTag
      className={
        ordered
          ? "my-4 list-decimal space-y-2 pl-5 text-[var(--ink)]"
          : "my-4 list-disc space-y-2 pl-5 text-[var(--ink)]"
      }
    >
      {items.map((item) => (
        <li key={item.slice(0, 48)}>{renderInlineMarkdown(item)}</li>
      ))}
    </ListTag>
  );
}

export type { ReactNode };
