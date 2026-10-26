import Link from "next/link";
import WebsiteFormError from "@/components/website/WebsiteFormError";
import ViewOnSiteLink from "@/components/dashboard/ViewOnSiteLink";
import DashPrimaryCta from "@/components/DashPrimaryCta";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { requireOwner } from "@/lib/session";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { appBaseUrl } from "@/lib/app-url";
import { shopBlogPath } from "@/lib/storefront/paths";
import { BLOG_INDEX_BUILTIN_ID } from "@/lib/studio/custom-pages";
import { ensureBlogSettings, extractBlogPosts, extractBlogTopics } from "@/lib/studio/blog";
import { syncBlogDefaults } from "./actions";
import BlogPostsTable from "./BlogPostsTable";

export default async function WebsiteBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; error?: string }>;
}) {
  const { owner } = await requireOwner();
  await syncBlogDefaults();
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const settings = ensureBlogSettings(storefront.draftConfig);
  const posts = extractBlogPosts(storefront.draftConfig).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
  const topics = extractBlogTopics(storefront.draftConfig);
  const params = await searchParams;
  const base = appBaseUrl();
  const preview = `${base}${shopBlogPath(storefront.slug, true)}`;

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-5 pb-12">
      <PageHeader
        title="Blog posts"
        subtitle="Write articles with rich text. Blog settings and the blog index layout are on the Blog page under Pages."
        actions={
          <>
            <ViewOnSiteLink href={preview} label="View blog" />
            <DashPrimaryCta href="/dashboard/website/blog/new">+ New post</DashPrimaryCta>
          </>
        }
      />

      {params.deleted ? <p className="text-sm font-medium text-[var(--ok)]">Post deleted.</p> : null}
      <WebsiteFormError error={params.error} fallback="Something went wrong." />
      {!settings.enabled ? (
        <p className="text-sm text-[var(--muted)]">
          Your blog is switched off.{" "}
          <Link href={`/dashboard/website/pages/${BLOG_INDEX_BUILTIN_ID}`} className="font-semibold underline">
            Blog settings
          </Link>
        </p>
      ) : null}

      {posts.length === 0 ? (
        <div className="dash-card px-4 py-10 text-center text-sm text-[var(--muted)]">No posts yet.</div>
      ) : (
        <BlogPostsTable posts={posts} topics={topics} />
      )}
    </main>
  );
}
