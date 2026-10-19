import type { BlogPost } from "@/generated/prisma/client";
import BlogBodyEditor from "@/components/blog/BlogBodyEditor";
import BlogFaqFields from "@/components/blog/BlogFaqFields";
import { parseFaqs } from "@/lib/blog/types";

const fieldClass =
  "w-full rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--leaf)] focus:ring-2";

export default function AdminBlogPostFields({ post }: { post: BlogPost }) {
  const slugLocked = Boolean(post.publishedAt);

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Title (H1)</span>
        <input
          name="title"
          defaultValue={post.title}
          required
          maxLength={160}
          className={`${fieldClass} text-lg font-semibold`}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm sm:col-span-1">
          <span className="font-medium">Section</span>
          <select name="section" defaultValue={post.section} className={fieldClass}>
            <option value="GUIDE">Guides (/guides)</option>
            <option value="NEWS">News (/farms-stand-news)</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-1">
          <span className="font-medium">Also list in</span>
          <select name="alsoListedIn" defaultValue={post.alsoListedIn ?? ""} className={fieldClass}>
            <option value="">Nowhere else</option>
            <option value="GUIDE">Guides index</option>
            <option value="NEWS">News index</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-1">
          <span className="font-medium">Slug {slugLocked ? "(locked once live)" : ""}</span>
          <input
            name="slug"
            defaultValue={post.slug}
            readOnly={slugLocked}
            maxLength={100}
            className={`${fieldClass} ${slugLocked ? "bg-[var(--panel)] text-[var(--muted)]" : ""}`}
          />
        </label>
      </div>

      <div className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Body</span>
        <BlogBodyEditor name="bodyHtml" defaultValue={post.bodyHtml} />
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">FAQs (shown under the article and in FAQ schema)</h2>
        <BlogFaqFields name="faqsJson" defaultValue={parseFaqs(post.faqs)} />
      </section>
    </div>
  );
}
