import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { adminBlogPath, adminBlogRevisionPath } from "@/lib/blog/paths";
import { parseResearchNotes, parseTargetQueries } from "@/lib/blog/types";
import { rejectBlogPostAction } from "../actions";
import AdminBlogPostFields from "./AdminBlogPostFields";
import AdminBlogPublishPanel from "./AdminBlogPublishPanel";
import AdminBlogResearchPanel from "./AdminBlogResearchPanel";

const SAVED_MESSAGES: Record<string, string> = {
  "1": "Saved.",
  published: "Published. It is live now.",
  scheduled: "Scheduled. It will go live at the chosen time.",
  archived: "Unpublished and archived.",
  revision: "Update published to the live post.",
};

export default async function AdminBlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { saved, error } = await searchParams;
  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: { revisions: { where: { status: "PENDING" }, select: { id: true } } },
  });
  if (!post) notFound();
  const pendingRevision = post.revisions[0];
  const authors = await prisma.blogAuthor.findMany({
    where: post.authorId ? { OR: [{ active: true }, { id: post.authorId }] } : { active: true },
    select: { id: true, name: true, jobTitle: true, active: true },
    orderBy: { name: "asc" },
  });

  return (
    <main className="flex flex-col gap-5">
      <Link href={adminBlogPath()} className="text-sm font-semibold text-[var(--leaf-dark)] underline">
        ← Back to blog queue
      </Link>
      {saved && SAVED_MESSAGES[saved] ? (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-900">{SAVED_MESSAGES[saved]}</p>
      ) : null}
      {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
      {pendingRevision ? (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          The agent has proposed an update to this post.{" "}
          <Link href={adminBlogRevisionPath(pendingRevision.id)} className="font-semibold underline">
            Review the highlighted changes
          </Link>
        </p>
      ) : null}

      <form className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <input type="hidden" name="id" value={post.id} />
        <AdminBlogPostFields post={post} />
        <div className="flex flex-col gap-4">
          <AdminBlogPublishPanel post={post} authors={authors} />
          <AdminBlogResearchPanel
            summary={post.agentSummary}
            notes={parseResearchNotes(post.researchNotes)}
            queries={parseTargetQueries(post.targetQueries)}
          />
        </div>
      </form>

      {post.status === "DRAFT" ? (
        <form action={rejectBlogPostAction} className="dash-card flex flex-col gap-2 p-4 sm:flex-row sm:items-end">
          <input type="hidden" name="id" value={post.id} />
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
            <span className="font-medium">Reject this draft (the agent reads this reason)</span>
            <input
              name="rejectionReason"
              required
              placeholder="Too generic, wrong audience, already covered…"
              className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--leaf)] focus:ring-2"
            />
          </label>
          <button type="submit" className="rounded-full bg-red-700 px-4 py-2 text-sm font-semibold text-white">
            Reject
          </button>
        </form>
      ) : null}
    </main>
  );
}
