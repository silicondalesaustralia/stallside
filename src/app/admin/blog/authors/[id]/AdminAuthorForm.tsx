import type { BlogAuthor } from "@/generated/prisma/client";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import AuthorAvatar from "@/components/blog/AuthorAvatar";
import BlogCountedField from "@/components/blog/BlogCountedField";
import { saveBlogAuthorAction } from "../actions";
import Field from "./AdminAuthorField";

const fieldClass =
  "w-full rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--leaf)] focus:ring-2";

export default function AdminAuthorForm({ author }: { author: BlogAuthor }) {
  return (
    <form action={saveBlogAuthorAction} className="dash-card flex flex-col gap-4 p-5">
      <input type="hidden" name="id" value={author.id} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name">
          <input name="name" defaultValue={author.name} required maxLength={100} className={fieldClass} />
        </Field>
        <Field label="Job title" hint="Shown in bylines and schema, e.g. Founder">
          <input name="jobTitle" defaultValue={author.jobTitle} required maxLength={100} className={fieldClass} />
        </Field>
        <Field label="Profile URL slug" hint="Public page: /authors/{slug}">
          <input name="slug" defaultValue={author.slug} maxLength={80} className={fieldClass} />
        </Field>
        <Field label="Expertise (comma separated)" hint="Shown on the profile and as knowsAbout in schema">
          <input name="expertise" defaultValue={author.expertise.join(", ")} maxLength={1000} className={fieldClass} />
        </Field>
      </div>

      <BlogCountedField
        name="shortBio"
        label="Short bio (author box under each article)"
        defaultValue={author.shortBio}
        max={300}
        ideal={120}
        multiline
      />
      <Field label="Full bio (profile page)" hint="Real experience and background. Blank line = new paragraph.">
        <textarea name="bio" defaultValue={author.bio} rows={8} maxLength={5000} className={fieldClass} />
      </Field>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <AuthorAvatar name={author.name} imageUrl={author.avatarUrl} size={72} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Field label="Photo" hint="Square headshot, JPEG/PNG/WebP under 900 KB">
            <input name="avatarFile" type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" />
          </Field>
          <Field label="Or photo URL">
            <input name="avatarUrl" defaultValue={author.avatarUrl ?? ""} maxLength={500} className={fieldClass} />
          </Field>
        </div>
      </div>

      <Field label="Social and profile links (one per line)" hint="LinkedIn, X, Instagram, Facebook, YouTube, personal site. Used as sameAs in schema.">
        <textarea
          name="sameAs"
          defaultValue={author.sameAs.join("\n")}
          rows={4}
          placeholder="https://www.linkedin.com/in/…"
          className={fieldClass}
        />
      </Field>

      <div className="flex flex-col gap-2 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="active" defaultChecked={author.active} />
          Public (profile page live, credited on posts)
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isDefault" defaultChecked={author.isDefault} />
          Default author for new drafts (including the daily agent)
        </label>
      </div>

      <button type="submit" className={`${dashCtaClass} self-start`}>Save author</button>
    </form>
  );
}
