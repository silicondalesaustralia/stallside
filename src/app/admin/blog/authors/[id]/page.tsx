import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { adminBlogAuthorsPath, authorPath } from "@/lib/blog/paths";
import AdminAuthorForm from "./AdminAuthorForm";

export default async function AdminBlogAuthorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { saved, error } = await searchParams;
  const author = await prisma.blogAuthor.findUnique({ where: { id } });
  if (!author) notFound();

  return (
    <main className="flex max-w-3xl flex-col gap-5">
      <Link href={adminBlogAuthorsPath()} className="text-sm font-semibold text-[var(--leaf-dark)] underline">
        ← All authors
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">{author.name}</h1>
        {author.active ? (
          <Link href={authorPath(author.slug)} target="_blank" className="text-sm font-semibold text-[var(--leaf-dark)] underline">
            View public profile
          </Link>
        ) : null}
      </div>
      {saved ? <p className="rounded-lg bg-green-50 p-3 text-sm text-green-900">Saved.</p> : null}
      {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
      <AdminAuthorForm author={author} />
    </main>
  );
}
