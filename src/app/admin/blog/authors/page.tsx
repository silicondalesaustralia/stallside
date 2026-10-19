import Link from "next/link";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import AuthorAvatar from "@/components/blog/AuthorAvatar";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { adminBlogAuthorPath, adminBlogPath } from "@/lib/blog/paths";
import { createBlogAuthorAction } from "./actions";

export default async function AdminBlogAuthorsPage() {
  await requireAdmin();
  const authors = await prisma.blogAuthor.findMany({
    orderBy: [{ active: "desc" }, { isDefault: "desc" }, { name: "asc" }],
    include: { _count: { select: { posts: true } } },
  });

  return (
    <main className="flex flex-col gap-6">
      <Link href={adminBlogPath()} className="text-sm font-semibold text-[var(--leaf-dark)] underline">
        ← Back to blog queue
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Authors</h1>
          <p className="mt-1 text-[var(--muted)]">
            Named authors get a public profile at /authors/… with Person schema. The default author is credited on new drafts.
          </p>
        </div>
        <form action={createBlogAuthorAction}>
          <button type="submit" className={dashCtaClass}>New author</button>
        </form>
      </div>
      {authors.length === 0 ? (
        <p className="dash-card p-4 text-sm text-[var(--muted)]">
          No authors yet. Until you add one, posts are credited to Vendl.
        </p>
      ) : (
        <ul className="dash-card divide-y divide-[var(--line)]">
          {authors.map((author) => (
            <li key={author.id}>
              <Link href={adminBlogAuthorPath(author.id)} className="flex items-center gap-3 p-4 hover:bg-[var(--panel)]">
                <AuthorAvatar name={author.name} imageUrl={author.avatarUrl} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {author.name}
                    {author.isDefault ? (
                      <span className="ml-2 rounded-full bg-[var(--marigold)] px-2 text-xs text-[var(--field)]">Default</span>
                    ) : null}
                    {!author.active ? (
                      <span className="ml-2 rounded-full bg-[var(--panel)] px-2 text-xs text-[var(--muted)]">Hidden</span>
                    ) : null}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    {author.jobTitle || "No job title"} · {author._count.posts} posts
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
