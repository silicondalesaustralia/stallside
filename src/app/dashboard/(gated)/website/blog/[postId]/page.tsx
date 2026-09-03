import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { appBaseUrl } from "@/lib/app-url";
import { shopBlogPostPath } from "@/lib/storefront/paths";
import { extractBlogPosts, extractBlogTopics, findBlogPostById } from "@/lib/studio/blog";
import BlogPostForm from "../BlogPostForm";
import {
  deleteBlogPost,
  publishBlogPost,
  unpublishBlogPost,
  updateBlogPost,
} from "../actions";

export default async function EditBlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ postId: string }>;
  searchParams: Promise<{ saved?: string; published?: string; unpublished?: string; created?: string; error?: string }>;
}) {
  const { owner } = await requireOwner();
  const { postId } = await params;
  const sp = await searchParams;
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const posts = extractBlogPosts(storefront.draftConfig);
  const post = findBlogPostById(posts, postId);
  if (!post) notFound();
  const topics = extractBlogTopics(storefront.draftConfig);
  const preview = `${appBaseUrl()}${shopBlogPostPath(storefront.slug, post.slug, true)}`;

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
            Edit: {post.title}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {post.status === "published" ? "Published" : "Draft"}
          </p>
        </div>
        <a href={preview} target="_blank" rel="noreferrer" className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold">
          Preview
        </a>
      </div>

      {sp.saved ? <p className="text-sm font-medium text-[var(--ok)]">Post saved.</p> : null}
      {sp.published ? <p className="text-sm font-medium text-[var(--ok)]">Post published.</p> : null}
      {sp.unpublished ? <p className="text-sm font-medium text-[var(--ok)]">Post unpublished.</p> : null}
      {sp.created ? <p className="text-sm font-medium text-[var(--ok)]">Post created — add your content below.</p> : null}
      {sp.error ? <p className="text-sm font-medium text-[var(--gone)]">Could not save — check title and slug.</p> : null}

      <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
        <BlogPostForm post={post} topics={topics} action={updateBlogPost.bind(null, post.id)} />
      </section>

      <section className="flex flex-wrap gap-3">
        {post.status === "draft" ? (
          <form action={publishBlogPost.bind(null, post.id)}>
            <button type="submit" className="rounded-full bg-[var(--field)] px-4 py-2 text-sm font-semibold text-white">
              Publish post
            </button>
          </form>
        ) : (
          <form action={unpublishBlogPost.bind(null, post.id)}>
            <button type="submit" className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold">
              Unpublish
            </button>
          </form>
        )}
        <form action={deleteBlogPost.bind(null, post.id)}>
          <button type="submit" className="rounded-full px-4 py-2 text-sm font-semibold text-[var(--gone)]">
            Delete post
          </button>
        </form>
      </section>
    </main>
  );
}
