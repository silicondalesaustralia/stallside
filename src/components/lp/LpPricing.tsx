import LpStartFreeLink from "@/components/lp/LpStartFreeLink";
import { sharedPlanFeatures } from "@/lib/shared-plan-features";

const FEE_BODY = [
  "Cash and local bank payments have no Vendl fee - PayID in Australia, Pay by Bank in the UK & Europe, and other local options where available. Card, Tap & Go and pay-later sales on Free include a 2.5% Vendl fee, plus standard Stripe processing fees.",
  "You can absorb the Vendl fee or pass it on to customers. Upgrade to Pro later to remove it.",
] as const;

type Props = {
  eyebrow?: string;
  headline?: string;
  body?: string[];
  /** Vertical-specific extras shown above the full shared feature list. */
  included?: string[];
  ctaLabel?: string;
  signupHref?: string;
  fullPricingHref?: string;
};

/** Drop AU-only payment bullets from vertical extras - covered by the shared list. */
function scrubPaymentExtras(items: string[]): string[] {
  return items.filter(
    (item) =>
      !/payid|payto|cash app|pay by bank|digital wallets|apple pay|google pay/i.test(
        item,
      ),
  );
}

export default function LpPricing({
  eyebrow = "Start free. Pay only when a card sale is made.",
  headline = "A$0 per month, with every Vendl feature.",
  included = [],
  ctaLabel,
  signupHref,
  fullPricingHref = "/#pricing",
}: Props) {
  const fullFeatures = sharedPlanFeatures();
  const extras = scrubPaymentExtras(included).filter(
    (item) => !fullFeatures.includes(item),
  );
  const features = [...extras, ...fullFeatures];
  const bodyLines = [...FEE_BODY];

  return (
    <section className="px-5 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl rounded-[var(--radius)] bg-[var(--field)] px-6 py-8 text-[var(--ink-on-dark)] shadow-lg sm:px-10 sm:py-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--marigold)]">
          {eyebrow}
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight sm:text-3xl">
          {headline}
        </h2>
        {bodyLines.map((p) => (
          <p
            key={p.slice(0, 40)}
            className="mt-4 text-sm leading-relaxed text-[var(--ink-on-dark)]/85 sm:text-base"
          >
            {p}
          </p>
        ))}

        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {features.map((item) => (
            <li key={item} className="flex gap-2 text-sm">
              <span aria-hidden className="text-[var(--marigold)]">
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col items-start gap-2">
          <LpStartFreeLink
            placement="pricing"
            label={ctaLabel}
            href={signupHref}
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--marigold)] px-6 py-3 text-base font-semibold text-[var(--field)] transition hover:brightness-105"
          />
          <p className="text-sm text-[var(--ink-on-dark)]/70">
            No card details required · No monthly commitment
          </p>
          <a
            href={fullPricingHref}
            className="mt-1 text-sm font-semibold text-[var(--ink-on-dark)] underline underline-offset-2 opacity-80 hover:opacity-100"
          >
            Compare Free and Pro fees
          </a>
        </div>
      </div>
    </section>
  );
}
