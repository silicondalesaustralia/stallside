import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { appBaseUrl } from "@/lib/app-url";
import { shopBlogPath } from "@/lib/storefront/paths";
import { BLOG_INDEX_BUILTIN_ID } from "@/lib/studio/custom-pages";
import {
  ensureBlogSettings,
  extractBlogPosts,
  extractBlogTopics,
  formatBlogDate,
  topicsForPost,
} from "@/lib/studio/blog";
import { syncBlogDefaults, updateBlogSettings } from "./actions";

export default async function WebsiteBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
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
    <main className="mx-auto flex max-w-4xl flex-col gap-8 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]">
            Blog
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--muted)]">
            Write articles with rich text. Craft sections on the blog index page control the intro layout.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/website/blog/new"
            className="rounded-full bg-[var(--field)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            New post
          </Link>
          <Link
            href="/dashboard/website/blog/topics"
            className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-semibold"
          >
            Topics
          </Link>
        </div>
      </div>

      {params.saved ? <p className="text-sm font-medium text-[var(--ok)]">Settings saved.</p> : null}
      {params.deleted ? <p className="text-sm font-medium text-[var(--ok)]">Post deleted.</p> : null}
      {params.error ? <p className="text-sm font-medium text-[var(--gone)]">Something went wrong.</p> : null}

      <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
        <h2 className="font-semibold text-[var(--field)]">Blog settings</h2>
        <form action={updateBlogSettings} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" name="enabled" defaultChecked={settings.enabled} />
            Blog enabled on storefront
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" name="showInNav" defaultChecked={settings.showInNav} />
            Show in header navigation
          </label>
          <label className="text-sm">
            <span className="font-medium">Nav label</span>
            <input name="navLabel" defaultValue={settings.navLabel} className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2" />
          </label>
          <label className="text-sm">
            <span className="font-medium">Index page title</span>
            <input name="indexTitle" defaultValue={settings.indexTitle} className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2" />
          </label>
          <div className="sm:col-span-2 flex flex-wrap gap-3">
            <button type="submit" className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold">
              Save settings
            </button>
            <Link
              href={`/dashboard/website/pages/${BLOG_INDEX_BUILTIN_ID}`}
              className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold"
            >
              Edit index layout
            </Link>
            <a href={preview} target="_blank" rel="noreferrer" className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold">
              Preview blog
            </a>
          </div>
        </form>
      </section>

      <section>
        <h2 className="font-semibold text-[var(--field)]">Posts</h2>
        {posts.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">No posts yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
            {posts.map((post) => {
              const postTopics = topicsForPost(topics, post);
              return (
                <li key={post.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div>
                    <p className="font-semibold text-[var(--field)]">{post.title}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      /blog/{post.slug}
                      {" · "}
                      {post.status === "published" ? "Published" : "Draft"}
                      {postTopics.length ? ` · ${postTopics.map((t) => t.name).join(", ")}` : ""}
                      {post.publishedAt || post.updatedAt
                        ? ` · ${formatBlogDate(post.publishedAt ?? post.updatedAt)}`
                        : ""}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/website/blog/${post.id}`}
                    className="rounded-full bg-[var(--field)] px-3 py-1.5 text-sm font-semibold text-white"
                  >
                    Edit
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
