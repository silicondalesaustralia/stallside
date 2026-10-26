import Link from "next/link";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import DataTableRow from "@/components/dashboard/ui/DataTableRow";
import StatusPill from "@/components/dashboard/ui/StatusPill";
import type { StorefrontBlogTopic } from "@/lib/studio/blog";
import { DEFAULT_BLOG_TOPIC } from "@/lib/studio/blog-topics";
import { deleteBlogTopic } from "../topic-actions";

const COLUMNS: DataColumn[] = [
  { label: "Category" },
  { label: "Posts", align: "right", hideBelow: "sm" },
  { label: "", align: "right" },
];

const ACTION = "font-semibold text-[var(--leaf-dark)] underline";

export default function BlogTopicsTable({
  topics,
  postCounts,
}: {
  topics: StorefrontBlogTopic[];
  postCounts: Map<string, number>;
}) {
  return (
    <DataTable columns={COLUMNS} footer={`${topics.length} categor${topics.length === 1 ? "y" : "ies"}`}>
      {topics.map((topic) => {
        const href = `/dashboard/website/blog/topics?topic=${encodeURIComponent(topic.id)}`;
        const isDefault = topic.id === DEFAULT_BLOG_TOPIC.id;
        return (
          <DataTableRow key={topic.id} href={href}>
            <td className={cellClass(COLUMNS[0])}>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={href} prefetch={false} className="font-semibold hover:underline">
                  {topic.name}
                </Link>
                {isDefault ? <StatusPill label="Default" tone="neutral" /> : null}
              </div>
              <p className="text-xs text-[var(--muted)]">/{topic.slug}</p>
            </td>
            <td className={`${cellClass(COLUMNS[1])} font-receipt whitespace-nowrap`}>
              {postCounts.get(topic.id) ?? 0}
            </td>
            <td className={cellClass(COLUMNS[2])}>
              <div className="flex items-center justify-end gap-3 whitespace-nowrap text-sm">
                <Link href={href} prefetch={false} className={ACTION}>
                  Edit
                </Link>
                {isDefault ? null : (
                  <form action={deleteBlogTopic.bind(null, topic.id)}>
                    <button type="submit" className="font-semibold text-[var(--gone)] underline">
                      Remove
                    </button>
                  </form>
                )}
              </div>
            </td>
          </DataTableRow>
        );
      })}
    </DataTable>
  );
}
