import Link from "next/link";
import EntitySeoCard from "@/components/website/seo/EntitySeoCard";
import type { StorefrontBlogTopic } from "@/lib/studio/blog";
import { BLOG_TOPIC_PAGE_PREFIX } from "@/lib/website/seo/entity-context";
import { entitySeoKey } from "@/lib/studio/seo-settings";
import { renameBlogTopic } from "../topic-actions";

const INPUT = "mt-1 block rounded-lg border border-[var(--line)] px-2 py-1.5 text-sm text-[var(--field)]";

/** Edit panel for the selected blog category: name, address, and its search & social settings. */
export default function BlogTopicEditor({
  topic,
  ownerId,
  businessName,
  seoStatus,
}: {
  topic: StorefrontBlogTopic;
  ownerId: string;
  businessName: string;
  seoStatus?: string;
}) {
  return (
    <section className="dash-card flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-[var(--field)]">Edit “{topic.name}”</h2>
        <Link href="/dashboard/website/blog/topics" className="text-sm font-semibold text-[var(--muted)] underline">
          Close
        </Link>
      </div>
      <form action={renameBlogTopic.bind(null, topic.id)} className="flex flex-wrap items-end gap-2">
        <label className="text-xs text-[var(--muted)]">
          Name
          <input name="name" defaultValue={topic.name} className={INPUT} />
        </label>
        <label className="text-xs text-[var(--muted)]">
          Address /
          <input name="slug" defaultValue={topic.slug} className={INPUT} />
        </label>
        <button type="submit" className="rounded-full border border-[var(--line)] px-3 py-1.5 text-sm font-semibold">
          Save
        </button>
      </form>
      <EntitySeoCard
        ownerId={ownerId}
        businessName={businessName}
        entityKey={entitySeoKey("page", `${BLOG_TOPIC_PAGE_PREFIX}${topic.id}`)}
        returnTo={`/dashboard/website/blog/topics?topic=${encodeURIComponent(topic.id)}`}
        status={seoStatus}
      />
    </section>
  );
}
