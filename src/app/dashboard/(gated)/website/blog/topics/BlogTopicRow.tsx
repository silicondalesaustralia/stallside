import EntitySeoCard from "@/components/website/seo/EntitySeoCard";
import type { StorefrontBlogTopic } from "@/lib/studio/blog";
import { DEFAULT_BLOG_TOPIC } from "@/lib/studio/blog-topics";
import { BLOG_TOPIC_PAGE_PREFIX } from "@/lib/website/seo/entity-context";
import { entitySeoKey } from "@/lib/studio/seo-settings";
import { deleteBlogTopic, renameBlogTopic } from "../topic-actions";

const INPUT = "mt-1 block rounded-lg border border-[var(--line)] px-2 py-1.5 text-sm text-[var(--field)]";

/** One blog category: name, address, remove, and its search & social settings. */
export default function BlogTopicRow({
  topic,
  ownerId,
  businessName,
  focused,
  seoStatus,
}: {
  topic: StorefrontBlogTopic;
  ownerId: string;
  businessName: string;
  /** Opened after a search & social save on this category. */
  focused: boolean;
  seoStatus?: string;
}) {
  return (
    <li className="flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <form action={renameBlogTopic.bind(null, topic.id)} className="flex flex-1 flex-wrap items-end gap-2">
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
        {topic.id === DEFAULT_BLOG_TOPIC.id ? (
          <span className="text-xs text-[var(--muted)]">Default</span>
        ) : (
          <form action={deleteBlogTopic.bind(null, topic.id)}>
            <button type="submit" className="text-sm font-semibold text-[var(--gone)]">
              Remove
            </button>
          </form>
        )}
      </div>
      <details open={focused}>
        <summary className="cursor-pointer text-sm font-semibold text-[var(--leaf-dark)]">
          Search &amp; social
        </summary>
        <div className="mt-3">
          <EntitySeoCard
            ownerId={ownerId}
            businessName={businessName}
            entityKey={entitySeoKey("page", `${BLOG_TOPIC_PAGE_PREFIX}${topic.id}`)}
            returnTo={`/dashboard/website/blog/topics?topic=${encodeURIComponent(topic.id)}`}
            status={focused ? seoStatus : undefined}
            anchor={focused}
          />
        </div>
      </details>
    </li>
  );
}
