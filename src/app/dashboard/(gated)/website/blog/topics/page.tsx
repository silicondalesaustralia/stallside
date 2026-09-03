import { requireOwner } from "@/lib/session";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { extractBlogTopics } from "@/lib/studio/blog";
import { createBlogTopic, deleteBlogTopic } from "../actions";

export default async function BlogTopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}) {
  const { owner } = await requireOwner();
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const topics = extractBlogTopics(storefront.draftConfig);
  const params = await searchParams;

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 pb-12">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]">
          Blog topics
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Group posts by topic — shown on the blog index and post pages.</p>
      </div>

      {params.saved ? <p className="text-sm font-medium text-[var(--ok)]">Topic added.</p> : null}
      {params.deleted ? <p className="text-sm font-medium text-[var(--ok)]">Topic removed.</p> : null}
      {params.error ? <p className="text-sm font-medium text-[var(--gone)]">Could not save topic.</p> : null}

      <form action={createBlogTopic} className="flex flex-wrap gap-3 rounded-2xl border border-[var(--line)] bg-white p-5">
        <input
          name="name"
          required
          placeholder="Topic name"
          className="min-w-[12rem] flex-1 rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-full bg-[var(--field)] px-4 py-2 text-sm font-semibold text-white">
          Add topic
        </button>
      </form>

      <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
        {topics.length === 0 ? (
          <li className="p-5 text-sm text-[var(--muted)]">No topics yet.</li>
        ) : (
          topics.map((topic) => (
            <li key={topic.id} className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="font-semibold text-[var(--field)]">{topic.name}</p>
                <p className="text-sm text-[var(--muted)]">{topic.slug}</p>
              </div>
              <form action={deleteBlogTopic.bind(null, topic.id)}>
                <button type="submit" className="text-sm font-semibold text-[var(--gone)]">
                  Remove
                </button>
              </form>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
