import Link from "next/link";
import PaymentBrandIcon from "@/components/PaymentBrandIcon";

const linkClass =
  "inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold hover:bg-[var(--wash)]";

export default function PaymentConnectionLinks({
  stripeStatus,
  squareStatus,
  paypalStatus,
  payIdAvailable,
}: {
  stripeStatus: string;
  squareStatus: string | null;
  paypalStatus: string | null;
  /** PayID is AUD businesses only. */
  payIdAvailable: boolean;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-semibold">Connections</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Connect a provider when you want card checkout, pre-orders or
          subscriptions. Cash
          {payIdAvailable ? " and PayID" : ""} work without one.
        </p>
      </div>
      <div className="flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap">
        <Link href="/dashboard/settings/stripe" className={linkClass}>
          <PaymentBrandIcon brand="stripe" className="size-5" />
          Stripe · {stripeStatus}
        </Link>
        {squareStatus ? (
          <Link href="/dashboard/settings/square" className={linkClass}>
            <PaymentBrandIcon brand="square" className="size-5" />
            Square · {squareStatus}
          </Link>
        ) : null}
        {paypalStatus ? (
          <Link href="/dashboard/settings/paypal" className={linkClass}>
            <PaymentBrandIcon brand="paypal" className="size-5" />
            PayPal · {paypalStatus}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
