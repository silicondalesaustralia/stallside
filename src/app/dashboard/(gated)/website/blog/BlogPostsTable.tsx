import Link from "next/link";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import DataTableRow from "@/components/dashboard/ui/DataTableRow";
import StatusPill from "@/components/dashboard/ui/StatusPill";
import { formatBlogDate, topicsForPost, type StorefrontBlogPost, type StorefrontBlogTopic } from "@/lib/studio/blog";
import { blogPostRelativePath } from "@/lib/studio/blog-topics";

const COLUMNS: DataColumn[] = [
  { label: "Post" },
  { label: "Status" },
  { label: "Categories", hideBelow: "md" },
  { label: "Date", hideBelow: "sm" },
];

const muted = "text-[var(--muted)]";

export default function BlogPostsTable({
  posts,
  topics,
}: {
  posts: StorefrontBlogPost[];
  topics: StorefrontBlogTopic[];
}) {
  return (
    <DataTable columns={COLUMNS} footer={`${posts.length} post${posts.length === 1 ? "" : "s"}`}>
      {posts.map((post) => {
        const href = `/dashboard/website/blog/${post.id}`;
        const postTopics = topicsForPost(topics, post);
        return (
          <DataTableRow key={post.id} href={href}>
            <td className={cellClass(COLUMNS[0])}>
              <Link href={href} prefetch={false} className="font-semibold hover:underline">
                {post.title}
              </Link>
              <p className={`text-xs ${muted}`}>{blogPostRelativePath(post, topics)}</p>
            </td>
            <td className={cellClass(COLUMNS[1])}>
              {post.status === "published" ? (
                <StatusPill label="Published" tone="success" />
              ) : (
                <StatusPill label="Draft" tone="neutral" />
              )}
            </td>
            <td className={`${cellClass(COLUMNS[2])} ${muted}`}>
              {postTopics.length ? postTopics.map((t) => t.name).join(", ") : "—"}
            </td>
            <td className={`${cellClass(COLUMNS[3])} whitespace-nowrap ${muted}`}>
              {formatBlogDate(post.publishedAt ?? post.updatedAt) || "—"}
            </td>
          </DataTableRow>
        );
      })}
    </DataTable>
  );
}
