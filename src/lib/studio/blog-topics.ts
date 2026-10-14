import type { StorefrontBlogPost, StorefrontBlogTopic } from "./blog";

/** Every blog has this category; posts without one live under it (`/news/{post}`). */
export const DEFAULT_BLOG_TOPIC: StorefrontBlogTopic = {
  id: "topic-news",
  slug: "news",
  name: "News",
};

/** Stored categories plus the default one when it hasn't been saved yet. */
export function withDefaultBlogTopic(topics: StorefrontBlogTopic[]): StorefrontBlogTopic[] {
  return topics.some((t) => t.id === DEFAULT_BLOG_TOPIC.id) ? topics : [...topics, DEFAULT_BLOG_TOPIC];
}

/** The category that sets a post's URL: its chosen main one, else its first, else the default. */
export function mainBlogTopic(
  post: Pick<StorefrontBlogPost, "topicIds" | "mainTopicId">,
  topics: StorefrontBlogTopic[],
): StorefrontBlogTopic {
  const all = withDefaultBlogTopic(topics);
  const byId = (id: string | null | undefined) => (id ? all.find((t) => t.id === id) : undefined);
  const chosen = post.mainTopicId && post.topicIds.includes(post.mainTopicId) ? byId(post.mainTopicId) : undefined;
  return chosen ?? post.topicIds.map(byId).find(Boolean) ?? byId(DEFAULT_BLOG_TOPIC.id) ?? DEFAULT_BLOG_TOPIC;
}

/** Relative clean path for a post, e.g. `/news/spring-eggs`. */
export function blogPostRelativePath(
  post: Pick<StorefrontBlogPost, "slug" | "topicIds" | "mainTopicId">,
  topics: StorefrontBlogTopic[],
): string {
  return `/${encodeURIComponent(mainBlogTopic(post, topics).slug)}/${encodeURIComponent(post.slug)}`;
}

/** Posts filed under a category (any of their categories, not only the main one). */
export function postsInBlogTopic<T extends Pick<StorefrontBlogPost, "topicIds" | "mainTopicId">>(
  posts: T[],
  topic: StorefrontBlogTopic,
  topics: StorefrontBlogTopic[],
): T[] {
  return posts.filter((p) => p.topicIds.includes(topic.id) || mainBlogTopic(p, topics).id === topic.id);
}
