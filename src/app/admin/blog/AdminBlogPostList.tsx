import Link from "next/link";
import type { AdminBlogPostRow } from "@/lib/blog/admin-queries";
import { adminBlogPostPath, blogSectionLabel } from "@/lib/blog/paths";

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Australia/Adelaide",
  }).format(date);
}

const SOURCE_LABELS: Record<string, string> = {
  GSC: "Search Console",
  KNOWLEDGE_BASE: "Knowledge base",
  FEATURE: "New feature",
  MARKET: "Market topic",
  NEWS: "Industry news",
  MANUAL: "Manual",
};

export default function AdminBlogPostList({ posts }: { posts: AdminBlogPostRow[] }) {
  if (posts.length === 0) {
    return <p className="dash-card p-5 text-[var(--muted)]">Nothing here right now.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {posts.map((post) => (
        <li key={post.id} className="dash-card p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            <span>{blogSectionLabel(post.section)}</span>
            <span aria-hidden>·</span>
            <span>{SOURCE_LABELS[post.source] ?? post.source}</span>
            {post.timeSensitive ? (
              <span className="rounded-full bg-[var(--marigold)] px-2 py-0.5 text-[var(--field)]">
                Time-sensitive
              </span>
            ) : null}
          </div>
          <Link
            href={adminBlogPostPath(post.id)}
            className="mt-1 block text-lg font-semibold text-[var(--field)] hover:underline"
          >
            {post.title}
          </Link>
          {post.agentSummary ? (
            <p className="mt-1 line-clamp-2 text-sm text-[var(--ink)]">{post.agentSummary}</p>
          ) : null}
          {post.rejectionReason ? (
            <p className="mt-1 text-sm text-red-800">Rejected: {post.rejectionReason}</p>
          ) : null}
          <p className="mt-2 text-xs text-[var(--muted)]">
            {post.status === "PUBLISHED"
              ? `Live ${formatDate(post.publishedAt)}`
              : `Updated ${formatDate(post.updatedAt)}`}
            {" · "}/{post.slug}
          </p>
        </li>
      ))}
    </ul>
  );
}
