import PaymentBrandIcon from "@/components/PaymentBrandIcon";
import type { PaymentBrand } from "@/lib/payment-brand-assets";

/** Subtle processor credit under customer-facing card checkout. */
export default function PoweredByRail({
  rail,
}: {
  rail: "stripe" | "square";
}) {
  const brand: PaymentBrand = rail;
  const label = rail === "stripe" ? "Stripe" : "Square";
  return (
    <p className="flex items-center justify-center gap-1.5 text-xs text-[var(--muted)]">
      <span>Powered by</span>
      <PaymentBrandIcon brand={brand} className="size-4" />
      <span className="sr-only">{label}</span>
    </p>
  );
}
