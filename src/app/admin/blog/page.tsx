import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { adminBlogAuthorsPath } from "@/lib/blog/paths";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import {
  loadAdminBlogCounts,
  loadAdminBlogPosts,
  loadAdminBlogRevisions,
  loadAdminBlogTopics,
  parseAdminBlogTab,
} from "@/lib/blog/admin-queries";
import AdminBlogTabs from "./AdminBlogTabs";
import AdminBlogPostList from "./AdminBlogPostList";
import AdminBlogRevisionList from "./AdminBlogRevisionList";
import AdminBlogTopicList from "./AdminBlogTopicList";
import { createManualBlogDraftAction } from "./actions";

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  await requireAdmin();
  const { tab: rawTab, error } = await searchParams;
  const tab = parseAdminBlogTab(rawTab);
  const now = new Date();
  const counts = await loadAdminBlogCounts(now);

  let content: React.ReactNode;
  if (tab === "revisions") {
    content = <AdminBlogRevisionList revisions={await loadAdminBlogRevisions()} />;
  } else if (tab === "topics") {
    content = <AdminBlogTopicList topics={await loadAdminBlogTopics()} />;
  } else {
    content = <AdminBlogPostList posts={await loadAdminBlogPosts(tab, now)} />;
  }

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
          <p className="mt-1 text-[var(--muted)]">
            Review the agent&apos;s daily drafts and updates, then publish to News or Guides.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={adminBlogAuthorsPath()}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold ring-1 ring-[var(--line)] hover:bg-[var(--panel)]"
          >
            Authors
          </Link>
          <form action={createManualBlogDraftAction}>
            <button type="submit" className={dashCtaClass}>New post</button>
          </form>
        </div>
      </div>
      {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
      <AdminBlogTabs active={tab} counts={counts} />
      {content}
    </main>
  );
}
