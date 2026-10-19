import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { adminBlogPath } from "@/lib/blog/paths";
import { verifyPickToken } from "@/lib/blog/pick-token";
import { confirmBlogPickAction } from "./actions";

export const metadata: Metadata = {
  title: "Write this post",
  robots: { index: false, follow: false },
};

const shell = "mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-4 px-6 py-16";

export default async function BlogPickPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; done?: string; error?: string }>;
}) {
  const { t = "", done, error } = await searchParams;
  const verified = verifyPickToken(t);
  const topic = verified
    ? await prisma.blogTopic.findUnique({
        where: { id: verified.topicId },
        select: { title: true, angle: true, targetPostSlug: true, selectedAt: true },
      })
    : null;

  if (!topic) {
    return (
      <main className={shell}>
        <h1 className="text-2xl font-bold text-[var(--field)]">This link has expired</h1>
        <p className="text-[var(--muted)]">Pick links last 7 days. You can still write any idea from the topic backlog.</p>
        <Link href={adminBlogPath("topics")} className="font-semibold text-[var(--leaf-dark)] underline">Open the topic backlog</Link>
      </main>
    );
  }

  return (
    <main className={shell}>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        {topic.targetPostSlug ? `Update to /${topic.targetPostSlug}` : "New post"}
      </p>
      <h1 className="text-2xl font-bold text-[var(--field)]">{topic.title}</h1>
      {topic.angle ? <p className="text-[var(--ink)]">{topic.angle}</p> : null}

      {done ? (
        <p className="rounded-lg bg-green-50 p-3 text-green-900">
          Writing has started. The draft, with images, will be in the review queue in about 10–20 minutes.
        </p>
      ) : error ? (
        <p className="rounded-lg bg-red-50 p-3 text-red-800">{error}</p>
      ) : topic.selectedAt ? (
        <p className="rounded-lg bg-amber-50 p-3 text-amber-900">Already picked. The draft is on its way.</p>
      ) : (
        <form action={confirmBlogPickAction}>
          <input type="hidden" name="t" value={t} />
          <button type="submit" className="rounded-full bg-[var(--leaf)] px-6 py-3 font-semibold text-white hover:bg-[var(--leaf-dark)]">
            Write this post
          </button>
        </form>
      )}
      <Link href={adminBlogPath()} className="text-sm font-semibold text-[var(--leaf-dark)] underline">Open the blog review queue</Link>
    </main>
  );
}
