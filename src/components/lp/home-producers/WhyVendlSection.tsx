import SquareStripeCallout from "@/components/lp/home-producers/SquareStripeCallout";
import LpStartFreeLink from "@/components/lp/LpStartFreeLink";
import {
  GOLD_CTA_CLASS,
  HOME_PRODUCERS_COPY,
  HOME_PRODUCERS_SIGNUP_HREF,
} from "@/lib/home-producers-lp";

const REASONS = [
  {
    title: "Know what to make before you make it.",
    body: "Set order deadlines, available quantities and collection windows. Take orders ahead of time and prepare from a clear list.",
  },
  {
    title: "Make regular customers regular orders.",
    body: "Offer subscriptions and memberships for weekly eggs, bread, produce boxes and more.",
  },
  {
    title: "Give every order room to grow.",
    body: "Offer extras, bundles and volume pricing to help customers discover more of what you sell.",
  },
  {
    title: "Spend less time organising orders.",
    body: "Track stock, manage collections and keep customers informed from one place.",
  },
  {
    title: "Keep customers coming back.",
    body: "Send branded emails and let customers opt in for restock alerts.",
  },
  {
    title: "Start with no monthly subscription.",
    body: "Your online shop and selling tools are included on the Free plan. Payment processing and applicable Vendl transaction fees still apply.",
  },
] as const;

export default function WhyVendlSection() {
  return (
    <section className="bg-[var(--wash)] px-5 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-[1.75rem] font-bold leading-[1.1] tracking-tight text-[var(--field)] sm:text-[2.5rem]">
            Your home business needs more than a website.
          </h2>
          <p className="mt-3 text-base text-[var(--muted)] sm:text-lg">
            Already using Shopify, Wix, Square, WooCommerce or Squarespace? If taking orders
            still means juggling messages, spreadsheets and extra tools, Vendl could be a
            better fit for the way you sell.
          </p>
          <p className="mt-3 text-base text-[var(--muted)] sm:text-lg">
            Bring your online shop, pre-orders, subscriptions, stock and customer
            communication together, with tools built around what you bake, grow or make.
          </p>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map((r) => (
            <li
              key={r.title}
              className="rounded-[20px] border border-[var(--line)] bg-[var(--panel)] p-5 shadow-sm"
            >
              <h3 className="flex items-start gap-2 font-[family-name:var(--font-display)] text-lg font-bold text-[var(--field)]">
                <span aria-hidden className="text-[var(--leaf)]">
                  ✓
                </span>
                {r.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{r.body}</p>
            </li>
          ))}
        </ul>

        <SquareStripeCallout />

        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <LpStartFreeLink
            placement="why-vendl"
            label={HOME_PRODUCERS_COPY.ctaLabel}
            href={HOME_PRODUCERS_SIGNUP_HREF}
            className={GOLD_CTA_CLASS}
          />
          <p className="text-sm text-[var(--muted)]">{HOME_PRODUCERS_COPY.reassurance}</p>
        </div>
      </div>
    </section>
  );
}
