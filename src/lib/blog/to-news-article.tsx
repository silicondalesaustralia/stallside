import BlogHtml from "@/components/blog/BlogHtml";
import type { BlogPost } from "@/generated/prisma/client";
import type { NewsArticle } from "@/lib/farms-stand-news/types";
import { blogAuthorToNewsAuthor, type PublicBlogAuthor } from "./authors";
import { blogPostPath, blogSectionIndexPath, blogSectionLabel } from "./paths";
import { blogHtmlWordCount } from "./sanitize-blog-html";
import { parseFaqs, parseResearchNotes } from "./types";

export type BlogPostRow = Pick<
  BlogPost,
  | "slug"
  | "section"
  | "title"
  | "seoTitle"
  | "seoDescription"
  | "excerpt"
  | "bodyHtml"
  | "faqs"
  | "keywords"
  | "heroImageUrl"
  | "heroImageAlt"
  | "heroImageWidth"
  | "heroImageHeight"
  | "researchNotes"
  | "publishedAt"
  | "contentUpdatedAt"
  | "createdAt"
> & { author: PublicBlogAuthor | null };

/** Map a DB post onto the existing NewsArticle shape (view + JSON-LD reuse). */
export function blogPostToNewsArticle(post: BlogPostRow): NewsArticle {
  const published = (post.publishedAt ?? post.createdAt).toISOString();
  const updated = (post.contentUpdatedAt ?? post.publishedAt ?? post.createdAt).toISOString();
  const notes = parseResearchNotes(post.researchNotes);
  const image =
    post.heroImageUrl && post.heroImageWidth && post.heroImageHeight
      ? {
          src: post.heroImageUrl,
          alt: post.heroImageAlt ?? post.title,
          width: post.heroImageWidth,
          height: post.heroImageHeight,
        }
      : undefined;
  const html = post.bodyHtml;

  return {
    slug: post.slug,
    canonicalPath: blogPostPath(post.section, post.slug),
    sectionLabel: blogSectionLabel(post.section),
    sectionPath: blogSectionIndexPath(post.section),
    title: post.title,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    excerpt: post.excerpt,
    publishedAt: published,
    updatedAt: updated,
    author: blogAuthorToNewsAuthor(post.author),
    image,
    keywords: post.keywords ?? undefined,
    wordCount: blogHtmlWordCount(html),
    articleSection: [blogSectionLabel(post.section)],
    speakableSelectors: [".post-title"],
    citations: notes.sources?.map((s) => ({ name: s.title, url: s.url })),
    faqs: parseFaqs(post.faqs),
    Content: function BlogPostContent() {
      return <BlogHtml html={html} />;
    },
  };
}
