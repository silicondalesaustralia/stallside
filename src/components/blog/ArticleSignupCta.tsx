import Link from "next/link";

export default function ArticleSignupCta({ slug }: { slug: string }) {
  const href = `/signup?utm_source=blog&utm_medium=article_cta&utm_campaign=${encodeURIComponent(slug)}`;
  return (
    <aside className="mt-14 rounded-[var(--radius-md)] bg-[var(--field)] p-6 text-white sm:p-8" aria-label="Start selling with Vendl">
      <p className="font-[family-name:var(--font-display)] text-2xl font-bold">Sell from your stall, kitchen or market with Vendl</p>
      <p className="mt-2 text-white/80">
        QR payments at the stand, pre-orders with pickup times, and an online shop, all in one place. Free is $0 a month with
        every feature.
      </p>
      <Link
        href={href}
        className="mt-5 inline-flex items-center justify-center rounded-full bg-[var(--marigold)] px-5 py-3 text-sm font-bold text-[var(--field)] hover:brightness-95"
      >
        Start selling free
      </Link>
    </aside>
  );
}
