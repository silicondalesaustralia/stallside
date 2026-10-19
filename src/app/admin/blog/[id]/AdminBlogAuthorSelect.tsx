import Link from "next/link";
import type { BlogAuthor } from "@/generated/prisma/client";
import { adminBlogAuthorsPath } from "@/lib/blog/paths";

export default function AdminBlogAuthorSelect({
  authors,
  value,
}: {
  authors: Pick<BlogAuthor, "id" | "name" | "jobTitle" | "active">[];
  value: string | null;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">Author</span>
      <select
        name="authorId"
        defaultValue={value ?? ""}
        className="w-full rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--leaf)] focus:ring-2"
      >
        <option value="">Choose an author</option>
        {authors.map((author) => (
          <option key={author.id} value={author.id}>
            {author.name}
            {author.jobTitle ? `, ${author.jobTitle}` : ""}
            {author.active ? "" : " (hidden)"}
          </option>
        ))}
      </select>
      {authors.length === 0 ? (
        <Link href={adminBlogAuthorsPath()} className="text-xs font-semibold text-[var(--leaf-dark)] underline">
          Add an author first
        </Link>
      ) : null}
    </label>
  );
}
