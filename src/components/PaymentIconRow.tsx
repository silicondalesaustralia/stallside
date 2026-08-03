import PaymentBrandIcon, {
  type PaymentBrand,
} from "@/components/PaymentBrandIcon";
import { WORDMARK_BRANDS } from "@/lib/payment-brand-assets";

export default function PaymentIconRow({
  brands,
  className = "",
}: {
  brands: PaymentBrand[];
  className?: string;
}) {
  return (
    <span className={`inline-flex flex-wrap items-center gap-1.5 text-[var(--ink)] ${className}`}>
      {brands.map((brand) => (
        <PaymentBrandIcon
          key={brand}
          brand={brand}
          className={
            WORDMARK_BRANDS.has(brand)
              ? "size-5 shrink-0 max-w-[3.75rem]"
              : "size-5 shrink-0"
          }
        />
      ))}
    </span>
  );
}
