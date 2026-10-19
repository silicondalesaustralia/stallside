import Link from "next/link";

export default function SidebarSignupCard({ slug }: { slug: string }) {
  const href = `/signup?utm_source=blog&utm_medium=article_cta&utm_campaign=${encodeURIComponent(slug)}&utm_content=sidebar`;
  return (
    <aside className="rounded-[var(--radius-md)] bg-[var(--field)] p-5 text-white" aria-label="Get a free Vendl account">
      <p className="font-[family-name:var(--font-display)] text-lg font-bold leading-snug">
        Sell from your stall, kitchen or market
      </p>
      <p className="mt-2 text-sm text-white/80">QR payments, pre-orders and an online shop. Free is $0 a month.</p>
      <Link
        href={href}
        className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[var(--marigold)] px-4 py-2.5 text-sm font-bold text-[var(--field)] hover:brightness-95"
      >
        Get My Free Vendl Account
      </Link>
    </aside>
  );
}
