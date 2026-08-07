import CardNetworkIcon from "@/components/CardNetworkIcon";
import PaymentBrandIcon from "@/components/PaymentBrandIcon";
import { APP_NAME } from "@/lib/constants";
import { WORDMARK_BRANDS } from "@/lib/payment-brand-assets";
import {
  LANDING_PAYMENT_MARKS,
  REGION_FLAG,
  REGION_LABEL,
  type LandingPaymentMark,
} from "@/lib/landing-payment-marks";

function MarkChip({ mark }: { mark: LandingPaymentMark }) {
  const iconClass =
    mark.brand && WORDMARK_BRANDS.has(mark.brand)
      ? "h-5 w-auto max-w-[3.25rem]"
      : "size-6";
  const showCashCaption = mark.brand === "cash";

  return (
    <span className="relative flex h-12 w-[4.75rem] shrink-0 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--panel)] px-2 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <span className="flex h-full w-full flex-col items-center justify-center gap-0.5 overflow-hidden">
        {mark.network ? (
          <CardNetworkIcon network={mark.network} className="h-6 w-10" />
        ) : mark.brand ? (
          <PaymentBrandIcon
            brand={mark.brand}
            className={showCashCaption ? "size-5" : iconClass}
          />
        ) : (
          <span className="text-[0.65rem] font-bold tracking-tight text-[var(--ink)]">
            {mark.label}
          </span>
        )}
        {showCashCaption ? (
          <span className="text-[0.6rem] font-semibold leading-none text-[var(--field)]">
            Cash
          </span>
        ) : null}
      </span>
      {mark.region ? (
        <span
          className="absolute -right-1.5 -top-1.5 text-[1.15rem] leading-none drop-shadow-sm"
          title={REGION_LABEL[mark.region]}
          aria-hidden
        >
          {REGION_FLAG[mark.region]}
        </span>
      ) : null}
      <span className="sr-only">
        {mark.label}
        {mark.region ? ` (${REGION_LABEL[mark.region]})` : ""}
      </span>
    </span>
  );
}

function MarkGroup({ prefix }: { prefix: string }) {
  return (
    <div
      className="ticker-group gap-3 px-1.5"
      aria-hidden={prefix !== "a" ? true : undefined}
    >
      {LANDING_PAYMENT_MARKS.map((mark) => (
        <span key={`${prefix}-${mark.id}`} className="px-1.5">
          <MarkChip mark={mark} />
        </span>
      ))}
    </div>
  );
}

/** Infinite scrolling payment-method strip for the homepage. */
export default function LandingPaymentMarquee() {
  return (
    <div
      className="ticker-tape payment-marquee relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--wash)]/70 py-4"
      aria-label={`Payment methods ${APP_NAME} supports by region`}
    >
      <div className="payment-marquee-fade pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[var(--wash)] to-transparent" />
      <div className="payment-marquee-fade pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[var(--wash)] to-transparent" />
      <div className="ticker-track payment-marquee-track">
        <MarkGroup prefix="a" />
        <MarkGroup prefix="b" />
      </div>
    </div>
  );
}
