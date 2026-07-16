import PaymentBrandIcon, {
  type PaymentBrand,
} from "@/components/PaymentBrandIcon";

export default function QrPaymentMethods({
  brands,
  compact = false,
}: {
  brands: PaymentBrand[];
  compact?: boolean;
}) {
  if (brands.length === 0) return null;

  return (
    <div
      className={`qr-sign-payments flex flex-col items-center ${
        compact ? "mt-2 gap-1" : "mt-4 gap-2"
      }`}
    >
      <p
        className={`font-semibold uppercase tracking-wide text-[var(--muted)] ${
          compact ? "text-[9px]" : "text-xs"
        }`}
      >
        Pay with
      </p>
      <div className="flex flex-wrap items-end justify-center gap-2">
        {brands.map((brand) => {
          const label = labelFor(brand);
          const showCaption = brand === "cash";
          return (
            <span
              key={brand}
              className="inline-flex flex-col items-center gap-0.5"
              title={label}
            >
              <span
                className={`inline-flex items-center justify-center rounded-md border border-[var(--line)] bg-white text-[var(--ink)] ${
                  brand === "payid"
                    ? compact
                      ? "h-7 px-1.5"
                      : "h-10 px-2"
                    : compact
                      ? "size-7"
                      : "size-10"
                }`}
              >
                <PaymentBrandIcon
                  brand={brand}
                  className={compact ? "size-4" : "size-6"}
                />
              </span>
              {showCaption ? (
                <span
                  className={`font-semibold leading-none text-[var(--field)] ${
                    compact ? "text-[8px]" : "text-[10px]"
                  }`}
                >
                  {label}
                </span>
              ) : null}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function labelFor(brand: PaymentBrand): string {
  switch (brand) {
    case "cash":
      return "Cash";
    case "payid":
      return "PayID";
    case "card":
      return "Card";
    case "apple":
      return "Apple Pay";
    case "google":
      return "Google Pay";
    case "paypal":
      return "PayPal";
    case "stripe":
      return "Stripe";
  }
}
