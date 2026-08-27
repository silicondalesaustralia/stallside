import Link from "next/link";
import {
  dashboardOnboardingDone,
  dashboardOnboardingSteps,
  resolveDashboardNextMove,
  type DashboardOnboardingPath,
} from "@/lib/dashboard-onboarding-path";
import {
  CASH_AND_LOCAL_PAYMENTS_LABEL,
  STRIPE_CHECKOUT_METHODS_PHRASE,
} from "@/lib/stripe-connect-copy";

export default function DashboardNextCard({
  onboardingPath,
  stripeConnected,
  stripeStarted,
  products,
  orderCount,
  preOrderPageCount,
  subscriptionOfferCount,
  showPreOrders,
  upgradeHref,
  upgradeLabel,
  qrHref,
}: {
  onboardingPath: DashboardOnboardingPath;
  stripeConnected: boolean;
  stripeStarted: boolean;
  products: number;
  orderCount: number;
  preOrderPageCount: number;
  subscriptionOfferCount: number;
  showPreOrders: boolean;
  upgradeHref: string | null;
  upgradeLabel: string | null;
  qrHref: string;
}) {
  const steps = dashboardOnboardingSteps(onboardingPath);
  const done = dashboardOnboardingDone({
    path: onboardingPath,
    products,
    orderCount,
    stripeConnected,
    preOrderPageCount,
    subscriptionOfferCount,
  });
  const firstIncomplete = done.findIndex((d) => !d);
  const active = firstIncomplete === -1 ? steps.length - 1 : firstIncomplete;

  const move = resolveDashboardNextMove({
    path: onboardingPath,
    stripeConnected,
    stripeStarted,
    products,
    orderCount,
    preOrderPageCount,
    subscriptionOfferCount,
    showPreOrders,
    upgradeHref,
    upgradeLabel,
    qrHref,
    cashAndLocalLabel: CASH_AND_LOCAL_PAYMENTS_LABEL,
    stripeMethodsPhrase: STRIPE_CHECKOUT_METHODS_PHRASE,
  });

  return (
    <div className="relative flex min-h-[205px] flex-[1.5] overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-[var(--field)] to-[var(--leaf-dark)] p-6 text-[var(--ink-on-dark)] shadow-[0_0_38px_-18px_rgb(23_54_31_/_0.5)]">
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--marigold)]">
          Your next move
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-[23px] font-bold leading-tight">
          {move.title}
        </h2>
        <p className="mt-3 text-sm text-[var(--ink-on-dark)]/75">{move.body}</p>
        <div className="mt-auto flex flex-col gap-2 pt-4">
          <Link
            href={move.href}
            className="inline-flex w-fit rounded-full bg-[var(--marigold)] px-5 py-2.5 text-sm font-bold text-[var(--field)]"
          >
            {move.cta}
          </Link>
          {move.secondaryHref && move.secondaryCta ? (
            <Link
              href={move.secondaryHref}
              className="text-sm font-semibold text-white/80 underline hover:text-white"
            >
              {move.secondaryCta}
            </Link>
          ) : null}
        </div>
      </div>
      <div className="ml-6 hidden w-[120px] shrink-0 flex-col sm:flex">
        {steps.map((label, i) => (
          <div key={label} className="flex gap-3" style={{ flex: i < 3 ? 1 : 0 }}>
            <div className="flex flex-col items-center">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                  i === active
                    ? "bg-[var(--marigold)] text-[var(--field)]"
                    : done[i]
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-white/45"
                }`}
              >
                {i + 1}
              </span>
              {i < 3 ? (
                <span className="my-1.5 w-0.5 flex-1 rounded-full bg-white/15" />
              ) : null}
            </div>
            <span
              className={`flex h-7 items-center text-[13px] font-semibold ${
                i === active ? "text-white" : "text-white/45"
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
