import "@/components/blog/blog-content.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { adminBlogPath, adminBlogPostPath, blogPostPath } from "@/lib/blog/paths";
import { parseChangeNotes, parseFaqs, parseTargetQueries } from "@/lib/blog/types";
import { discardRevisionAction } from "../../revision-actions";
import AdminBlogResearchPanel from "../../[id]/AdminBlogResearchPanel";
import RevisionReviewForm from "./RevisionReviewForm";

export default async function AdminBlogRevisionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { error } = await searchParams;
  const revision = await prisma.blogPostRevision.findUnique({ where: { id }, include: { post: true } });
  if (!revision) notFound();
  const { post } = revision;
  const notes = parseChangeNotes(revision.changeNotes);
  const base = { title: post.title, seoTitle: post.seoTitle, seoDescription: post.seoDescription, excerpt: post.excerpt };
  const proposed = {
    title: revision.proposedTitle ?? post.title,
    seoTitle: revision.proposedSeoTitle ?? post.seoTitle,
    seoDescription: revision.proposedSeoDescription ?? post.seoDescription,
    excerpt: revision.proposedExcerpt ?? post.excerpt,
  };

  return (
    <main className="flex flex-col gap-5">
      <Link href={adminBlogPath("revisions")} className="text-sm font-semibold text-[var(--leaf-dark)] underline">
        ← Back to updates
      </Link>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Proposed update</p>
        <h1 className="text-2xl font-semibold tracking-tight">{post.title}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          <Link href={blogPostPath(post.section, post.slug)} target="_blank" className="underline">View live post</Link>
          {" · "}
          <Link href={adminBlogPostPath(post.id)} className="underline">Edit post directly</Link>
          {revision.status !== "PENDING" ? ` · This revision is ${revision.status.toLowerCase()}` : ""}
        </p>
      </div>
      {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}

      {notes.length ? (
        <section className="dash-card p-4">
          <h2 className="font-semibold text-[var(--field)]">What changed and why</h2>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {notes.map((note) => (
              <li key={note.section} className="blog-diff-added rounded-md">
                <span className="font-semibold">{note.section}:</span> {note.reason}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <RevisionReviewForm
        revisionId={revision.id}
        baseHtml={revision.baseBodyHtml}
        proposedHtml={revision.proposedBodyHtml}
        base={base}
        proposed={proposed}
        faqs={parseFaqs(revision.proposedFaqs ?? post.faqs)}
        stale={post.updatedAt > revision.baseUpdatedAt}
      />

      <AdminBlogResearchPanel summary={revision.agentSummary} notes={{}} queries={parseTargetQueries(revision.targetQueries)} />

      {revision.status === "PENDING" ? (
        <form action={discardRevisionAction} className="dash-card flex flex-col gap-2 p-4 sm:flex-row sm:items-end">
          <input type="hidden" name="revisionId" value={revision.id} />
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
            <span className="font-medium">Discard this update (the agent reads this reason)</span>
            <input
              name="discardReason"
              required
              placeholder="Changes dilute the main point, wrong facts…"
              className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--leaf)] focus:ring-2"
            />
          </label>
          <button type="submit" className="rounded-full bg-red-700 px-4 py-2 text-sm font-semibold text-white">
            Discard
          </button>
        </form>
      ) : null}
    </main>
  );
}
