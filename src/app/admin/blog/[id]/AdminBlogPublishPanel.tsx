import Link from "next/link";
import type { ComponentProps } from "react";
import type { BlogPost } from "@/generated/prisma/client";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import BlogCountedField from "@/components/blog/BlogCountedField";
import BlogScheduleField from "@/components/blog/BlogScheduleField";
import { blogPostPath } from "@/lib/blog/paths";
import {
  publishBlogPostAction,
  saveBlogPostAction,
  scheduleBlogPostAction,
  unpublishBlogPostAction,
} from "../actions";
import AdminBlogAuthorSelect from "./AdminBlogAuthorSelect";

const fieldClass =
  "w-full rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--leaf)] focus:ring-2";
const secondaryClass =
  "rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-[var(--line)] bg-white hover:bg-[var(--panel)]";

export default function AdminBlogPublishPanel({
  post,
  authors,
}: {
  post: BlogPost;
  authors: ComponentProps<typeof AdminBlogAuthorSelect>["authors"];
}) {
  const now = new Date();
  const live = post.status === "PUBLISHED" && post.publishedAt !== null && post.publishedAt <= now;
  const scheduled = post.status === "PUBLISHED" && post.publishedAt !== null && post.publishedAt > now;

  return (
    <div className="flex flex-col gap-4">
      <section className="dash-card flex flex-col gap-3 p-4">
        <p className="text-sm">
          Status:{" "}
          <span className="font-semibold">
            {live ? "Live" : scheduled ? `Scheduled ${post.publishedAt?.toLocaleString("en-AU")}` : post.status.toLowerCase()}
          </span>
        </p>
        <AdminBlogAuthorSelect authors={authors} value={post.authorId} />
        <div className="flex flex-wrap gap-2">
          <button type="submit" formAction={publishBlogPostAction} className={dashCtaClass}>
            {live ? "Update live post" : "Publish now"}
          </button>
          <button type="submit" formAction={saveBlogPostAction} className={secondaryClass}>
            Save
          </button>
          <Link href={`/admin/blog/${post.id}/preview`} target="_blank" className={secondaryClass}>
            Preview
          </Link>
          {live ? (
            <Link href={blogPostPath(post.section, post.slug)} target="_blank" className={secondaryClass}>
              View live
            </Link>
          ) : null}
        </div>
        {!live ? (
          <div className="flex flex-col gap-2 border-t border-[var(--line)] pt-3">
            <BlogScheduleField name="scheduledFor" />
            <button type="submit" formAction={scheduleBlogPostAction} className={secondaryClass}>
              Schedule
            </button>
          </div>
        ) : (
          <button type="submit" formAction={unpublishBlogPostAction} className="self-start text-sm font-semibold text-red-700 underline">
            Unpublish (archive)
          </button>
        )}
      </section>

      <section className="dash-card flex flex-col gap-3 p-4">
        <h2 className="font-semibold text-[var(--field)]">Search appearance</h2>
        <BlogCountedField name="seoTitle" label="SEO title" defaultValue={post.seoTitle} max={70} ideal={40} />
        <BlogCountedField name="seoDescription" label="SEO description" defaultValue={post.seoDescription} max={170} ideal={120} multiline />
        <BlogCountedField name="excerpt" label="Excerpt (listing pages)" defaultValue={post.excerpt} max={400} ideal={80} multiline />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Keywords (comma separated)</span>
          <input name="keywords" defaultValue={post.keywords ?? ""} maxLength={400} className={fieldClass} />
        </label>
      </section>

      <section className="dash-card flex flex-col gap-3 p-4">
        <h2 className="font-semibold text-[var(--field)]">Hero image (optional)</h2>
        <input name="heroImageUrl" defaultValue={post.heroImageUrl ?? ""} placeholder="https://… or /news/…" className={fieldClass} />
        <input name="heroImageAlt" defaultValue={post.heroImageAlt ?? ""} placeholder="Alt text" className={fieldClass} />
        <div className="grid grid-cols-2 gap-2">
          <input name="heroImageWidth" type="number" defaultValue={post.heroImageWidth ?? ""} placeholder="Width" className={fieldClass} />
          <input name="heroImageHeight" type="number" defaultValue={post.heroImageHeight ?? ""} placeholder="Height" className={fieldClass} />
        </div>
      </section>
    </div>
  );
}
