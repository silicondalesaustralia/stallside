import PaymentBrandIcon, {
  type PaymentBrand,
} from "@/components/PaymentBrandIcon";

export default function PaymentIconRow({
  brands,
  className = "",
}: {
  brands: PaymentBrand[];
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[var(--ink)] ${className}`}>
      {brands.map((brand) => (
        <PaymentBrandIcon
          key={brand}
          brand={brand}
          className={
            brand === "payid" ? "size-5 shrink-0 max-w-[3.25rem]" : "size-5 shrink-0"
          }
        />
      ))}
    </span>
  );
}
