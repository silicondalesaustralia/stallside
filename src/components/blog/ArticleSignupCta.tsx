import Link from "next/link";

type Placement = "mid" | "end";

const COPY: Record<Placement, { heading: string; body: string }> = {
  mid: {
    heading: "Selling from a stall, kitchen or market?",
    body: "Vendl gives you QR payments, pre-orders with pickup times and an online shop in one place.",
  },
  end: {
    heading: "Sell from your stall, kitchen or market with Vendl",
    body: "QR payments at the stand, pre-orders with pickup times, and an online shop, all in one place. Free is $0 a month with every feature.",
  },
};

export default function ArticleSignupCta({ slug, placement }: { slug: string; placement: Placement }) {
  const href = `/signup?utm_source=blog&utm_medium=article_cta&utm_campaign=${encodeURIComponent(slug)}&utm_content=${placement}`;
  const copy = COPY[placement];
  return (
    <aside
      className={`rounded-[var(--radius-md)] bg-[var(--field)] text-white ${placement === "mid" ? "my-10 p-5 sm:p-6" : "mt-14 p-6 sm:p-8"}`}
      aria-label="Get a free Vendl account"
    >
      <p className={`font-[family-name:var(--font-display)] font-bold ${placement === "mid" ? "text-xl" : "text-2xl"}`}>
        {copy.heading}
      </p>
      <p className="mt-2 text-base text-white/80">{copy.body}</p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center justify-center rounded-full bg-[var(--marigold)] px-5 py-3 text-sm font-bold text-[var(--field)] no-underline hover:brightness-95"
      >
        Get My Free Vendl Account
      </Link>
    </aside>
  );
}
