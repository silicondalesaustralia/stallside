import Link from "next/link";
import PaymentBrandIcon from "@/components/PaymentBrandIcon";

const linkClass =
  "inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold hover:bg-[var(--wash)]";

export default function PaymentConnectionLinks({
  stripeStatus,
  squareStatus,
}: {
  stripeStatus: string;
  squareStatus: string;
}) {
  return (
    <section className="flex flex-col gap-3 text-sm sm:flex-row">
      <Link href="/dashboard/settings/stripe" className={linkClass}>
        <PaymentBrandIcon brand="stripe" className="size-5" />
        Stripe · {stripeStatus}
      </Link>
      <Link href="/dashboard/settings/square" className={linkClass}>
        <PaymentBrandIcon brand="square" className="size-5" />
        Square · {squareStatus}
      </Link>
    </section>
  );
}
