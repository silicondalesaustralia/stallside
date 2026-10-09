"use client";

import SignHtmlEditor from "@/components/SignHtmlEditor";
import type { StorefrontBlogPost, StorefrontBlogTopic } from "@/lib/studio/blog";

export default function BlogPostForm({
  post,
  topics,
  action,
}: {
  post: StorefrontBlogPost;
  topics: StorefrontBlogTopic[];
  action: (formData: FormData) => void | Promise<void>;
}) {
  const selected = new Set(post.topicIds);

  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium">Title</span>
          <input
            name="title"
            required
            defaultValue={post.title}
            className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">URL slug</span>
          <input
            name="slug"
            required
            defaultValue={post.slug}
            className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Featured image URL</span>
          <input
            name="featuredImageUrl"
            type="url"
            defaultValue={post.featuredImageUrl ?? ""}
            placeholder="https://"
            className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium">Excerpt</span>
          <textarea
            name="excerpt"
            rows={2}
            maxLength={320}
            defaultValue={post.excerpt}
            placeholder="Short summary for the blog index"
            className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2"
          />
        </label>
      </div>

      {topics.length > 0 ? (
        <fieldset>
          <legend className="text-sm font-medium">Topics</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {topics.map((topic) => (
              <label key={topic.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name={`topic_${topic.id}`}
                  defaultChecked={selected.has(topic.id)}
                  value={topic.id}
                  onChange={(e) => {
                    const hidden = document.getElementById("topicIds") as HTMLInputElement | null;
                    if (!hidden) return;
                    const ids = new Set(hidden.value.split(",").filter(Boolean));
                    if (e.target.checked) ids.add(topic.id);
                    else ids.delete(topic.id);
                    hidden.value = Array.from(ids).join(",");
                  }}
                />
                {topic.name}
              </label>
            ))}
          </div>
          <input type="hidden" id="topicIds" name="topicIds" defaultValue={post.topicIds.join(",")} />
        </fieldset>
      ) : (
        <input type="hidden" name="topicIds" value="" />
      )}

      <div>
        <p className="text-sm font-medium">Article body</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Rich text for the post content. Layout sections around the blog are edited separately.
        </p>
        <div className="mt-3">
          <SignHtmlEditor name="bodyHtml" defaultValue={post.bodyHtml} height={360} />
        </div>
      </div>

      <button type="submit" className="rounded-full bg-[var(--field)] px-5 py-2.5 text-sm font-semibold text-white">
        Save post
      </button>
    </form>
  );
}
