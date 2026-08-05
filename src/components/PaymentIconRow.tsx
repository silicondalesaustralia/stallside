import PaymentBrandIcon, {
  type PaymentBrand,
} from "@/components/PaymentBrandIcon";
import { WORDMARK_BRANDS } from "@/lib/payment-brand-assets";

export default function PaymentIconRow({
  brands,
  className = "",
  size = "md",
}: {
  brands: PaymentBrand[];
  className?: string;
  size?: "md" | "lg";
}) {
  return (
    <span
      className={`flex flex-wrap items-center justify-center gap-1.5 text-[var(--ink)] ${className}`}
    >
      {brands.map((brand) => {
        const wide = WORDMARK_BRANDS.has(brand);
        const cls =
          size === "lg"
            ? wide
              ? "h-7 shrink-0 max-w-[5.5rem]"
              : "size-7 shrink-0"
            : wide
              ? "size-5 shrink-0 max-w-[3.75rem]"
              : "size-5 shrink-0";
        return (
          <PaymentBrandIcon key={brand} brand={brand} className={cls} />
        );
      })}
    </span>
  );
}
