import { requireOwner } from "@/lib/session";
import WebsiteFormError from "@/components/website/WebsiteFormError";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import SiteSlugClashNotice from "@/components/website/SiteSlugClashNotice";
import { extractBlogTopics } from "@/lib/studio/blog";
import { withDefaultBlogTopic } from "@/lib/studio/blog-topics";
import { createBlogTopic } from "../topic-actions";
import BlogTopicRow from "./BlogTopicRow";

export default async function BlogTopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string; msg?: string; topic?: string; seo?: string }>;
}) {
  const { owner } = await requireOwner();
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const topics = withDefaultBlogTopic(extractBlogTopics(storefront.draftConfig));
  const params = await searchParams;

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 pb-12">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]">
          Blog categories
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Every post sits in a main category, which sets its address: <strong>/category/post-title</strong>. Each
          category also gets its own page at <strong>/category</strong>.
        </p>
      </div>

      <SiteSlugClashNotice ownerId={owner.id} configRaw={storefront.draftConfig} />
      {params.saved ? <p className="text-sm font-medium text-[var(--ok)]">Category saved.</p> : null}
      {params.deleted ? <p className="text-sm font-medium text-[var(--ok)]">Category removed.</p> : null}
      <WebsiteFormError error={params.error} fallback={params.msg ?? "Could not save the category."} />

      <form action={createBlogTopic} className="flex flex-wrap gap-3 rounded-2xl border border-[var(--line)] bg-white p-5">
        <input
          name="name"
          required
          placeholder="Category name"
          className="min-w-[12rem] flex-1 rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-full bg-[var(--field)] px-4 py-2 text-sm font-semibold text-white">
          Add category
        </button>
      </form>

      <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
        {topics.length === 0 ? (
          <li className="p-5 text-sm text-[var(--muted)]">No topics yet.</li>
        ) : (
          topics.map((topic) => (
            <BlogTopicRow
              key={topic.id}
              topic={topic}
              ownerId={owner.id}
              businessName={owner.businessName}
              focused={params.topic === topic.id}
              seoStatus={params.seo}
            />
          ))
        )}
      </ul>
    </main>
  );
}
