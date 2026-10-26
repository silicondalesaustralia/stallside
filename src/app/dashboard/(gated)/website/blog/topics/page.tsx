import { requireOwner } from "@/lib/session";
import WebsiteFormError from "@/components/website/WebsiteFormError";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import SiteSlugClashNotice from "@/components/website/SiteSlugClashNotice";
import { extractBlogPosts, extractBlogTopics } from "@/lib/studio/blog";
import { mainBlogTopic, withDefaultBlogTopic } from "@/lib/studio/blog-topics";
import { createBlogTopic } from "../topic-actions";
import BlogTopicEditor from "./BlogTopicEditor";
import BlogTopicsTable from "./BlogTopicsTable";

export default async function BlogTopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string; msg?: string; topic?: string; seo?: string }>;
}) {
  const { owner } = await requireOwner();
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const topics = withDefaultBlogTopic(extractBlogTopics(storefront.draftConfig));
  const posts = extractBlogPosts(storefront.draftConfig);
  const params = await searchParams;
  const editing = topics.find((t) => t.id === params.topic);

  const postCounts = new Map<string, number>();
  for (const topic of topics) {
    const count = posts.filter((p) => p.topicIds.includes(topic.id) || mainBlogTopic(p, topics).id === topic.id).length;
    postCounts.set(topic.id, count);
  }

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-5 pb-12">
      <PageHeader
        title="Blog categories"
        subtitle={
          <>
            Every post sits in a main category, which sets its address: <strong>/category/post-title</strong>. Each
            category also gets its own page at <strong>/category</strong>.
          </>
        }
      />

      <SiteSlugClashNotice ownerId={owner.id} configRaw={storefront.draftConfig} />
      {params.saved ? <p className="text-sm font-medium text-[var(--ok)]">Category saved.</p> : null}
      {params.deleted ? <p className="text-sm font-medium text-[var(--ok)]">Category removed.</p> : null}
      <WebsiteFormError error={params.error} fallback={params.msg ?? "Could not save the category."} />

      <form action={createBlogTopic} className="dash-card flex flex-wrap gap-3 p-4">
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

      {editing ? (
        <BlogTopicEditor
          key={editing.id}
          topic={editing}
          ownerId={owner.id}
          businessName={owner.businessName}
          seoStatus={params.seo}
        />
      ) : null}

      {topics.length === 0 ? (
        <div className="dash-card px-4 py-10 text-center text-sm text-[var(--muted)]">No topics yet.</div>
      ) : (
        <BlogTopicsTable topics={topics} postCounts={postCounts} />
      )}
    </main>
  );
}
