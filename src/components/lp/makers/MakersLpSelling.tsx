import Link from "next/link";
import { HOME_EYEBROW, HOME_H2, HOME_H3, HOME_TEXT_LINK, HOME_WRAP } from "@/components/lp/makers/makers-lp-styles";
import { homeSellingItems } from "@/lib/makers-lp-page-copy";

export default function MakersLpSelling({ showSocial }: { showSocial: boolean }) {
  return (
    <section className={`${HOME_WRAP} grid gap-9 py-16 md:grid-cols-2 md:gap-24 md:py-[100px]`}>
      <div>
        <p className={HOME_EYEBROW}>MORE WAYS TO SELL</p>
        <h2 className={HOME_H2}>
          Your next order.
          <br />
          And the one after.
        </h2>
        <p className="my-6 max-w-[450px] text-[var(--muted)]">
          Take pre-orders, offer subscriptions and keep customers close with email and restock alerts.
          {showSocial ? " Create and plan social content from the same place you run your business." : null}
        </p>
        {showSocial ? (
          <p className="mb-6 text-xs text-[var(--muted)]">
            Social uses credits. Pro includes a monthly allowance; extra packs are available.
          </p>
        ) : null}
        <Link href="/signup" className={HOME_TEXT_LINK}>
          Start building your customer base →
        </Link>
      </div>
      <div>
        {homeSellingItems(showSocial).map((item, i) => (
          <article key={item.title} className="flex gap-6 border-b border-[var(--line)] py-6 first:pt-0">
            <span className="text-xs text-[#8b9484]">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h3 className={`${HOME_H3} mb-2 text-2xl`}>{item.title}</h3>
              <p className="text-sm text-[var(--muted)]">{item.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
