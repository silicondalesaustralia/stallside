import PaymentBrandIcon from "@/components/PaymentBrandIcon";
import { paymentBrandLabel, WORDMARK_BRANDS, type PaymentBrand } from "@/lib/payment-brand-assets";

/** Payment marks under the product page's cart buttons. Nothing shows until a payment method is on. */
export default function ProductPaymentStrip({ brands }: { brands: PaymentBrand[] }) {
  if (!brands.length) return null;
  return (
    <ul className="mx-auto mt-3 flex w-full max-w-xs flex-wrap items-center justify-center gap-2" aria-label="Ways to pay">
      {brands.map((brand) => (
        <li key={brand} className="flex h-8 items-center rounded-md border border-[var(--line)] bg-white px-2" title={paymentBrandLabel(brand)}>
          <PaymentBrandIcon brand={brand} className={WORDMARK_BRANDS.has(brand) ? "h-4 w-auto max-w-[3.5rem]" : "size-5"} />
          <span className="sr-only">{paymentBrandLabel(brand)}</span>
        </li>
      ))}
    </ul>
  );
}
