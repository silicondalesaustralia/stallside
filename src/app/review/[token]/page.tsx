import Link from "next/link";
import { notFound } from "next/navigation";
import { submitReview } from "@/lib/grow/reviews";
import { prisma } from "@/lib/prisma";
import { dashCtaClass } from "@/components/DashPrimaryCta";

export default async function PublicReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { token } = await params;
  const sp = await searchParams;
  const review = await prisma.review.findUnique({
    where: { token },
    include: {
      owner: { select: { businessName: true } },
    },
  });
  if (!review) notFound();

  async function action(formData: FormData) {
    "use server";
    try {
      await submitReview({
        token,
        rating: Number(formData.get("rating")),
        title: String(formData.get("title") ?? ""),
        body: String(formData.get("body") ?? ""),
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not save";
      const { redirect } = await import("next/navigation");
      redirect(`/review/${token}?error=${encodeURIComponent(msg)}`);
    }
    const { redirect } = await import("next/navigation");
    redirect(`/review/${token}?saved=1`);
  }

  if (sp.saved || (review.rating >= 1 && review.body)) {
    return (
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-2xl font-semibold">Thanks for your review</h1>
        <p className="mt-2 text-[var(--muted)]">
          {review.owner.businessName} appreciates your feedback.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <p className="text-sm text-[var(--muted)]">{review.owner.businessName}</p>
      <h1 className="mt-1 text-2xl font-semibold">How was your order?</h1>
      {sp.error ? (
        <p className="mt-2 text-sm text-[var(--gone)]">{sp.error}</p>
      ) : null}
      <form action={action} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Rating</span>
          <select
            name="rating"
            required
            defaultValue="5"
            className="rounded-lg border border-[var(--line)] px-3 py-2"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} star{n === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Title (optional)</span>
          <input name="title" className="rounded-lg border border-[var(--line)] px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Your review</span>
          <textarea
            name="body"
            required
            rows={4}
            className="rounded-lg border border-[var(--line)] px-3 py-2"
          />
        </label>
        <button type="submit" className={dashCtaClass}>
          Submit review
        </button>
      </form>
      <p className="mt-6 text-xs text-[var(--muted)]">
        <Link href="/" className="underline">
          Vendl
        </Link>
      </p>
    </main>
  );
}
