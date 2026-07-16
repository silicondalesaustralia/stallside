import PaymentBrandIcon, {
  type PaymentBrand,
} from "@/components/PaymentBrandIcon";

const METHODS: {
  brand: PaymentBrand;
  label: string;
  note: string;
  regions: string;
  status: "live" | "soon";
}[] = [
  {
    brand: "cash",
    label: "Cash",
    note: "Honesty-box confirm",
    regions: "All regions",
    status: "live",
  },
  {
    brand: "payid",
    label: "PayID",
    note: "Bank transfer confirm",
    regions: "Australia (AUD stands)",
    status: "live",
  },
  {
    brand: "card",
    label: "Card",
    note: "Tap & Go via Stripe",
    regions: "AU, US, UK, EU & Stripe countries",
    status: "live",
  },
  {
    brand: "apple",
    label: "Apple Pay",
    note: "On Stripe Checkout",
    regions: "All available countries",
    status: "live",
  },
  {
    brand: "google",
    label: "Google Pay",
    note: "On Stripe Checkout",
    regions: "All available countries",
    status: "live",
  },
  {
    brand: "paypal",
    label: "PayPal",
    note: "Coming soon",
    regions: "PayPal Business countries",
    status: "soon",
  },
];

export default function LandingPaymentMethods() {
  return (
    <section
      id="payments"
      className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-12"
    >
      <div className="relative mb-4">
        <div
          aria-hidden
          className="absolute left-0 top-0 size-8 border-l-2 border-t-2 border-[var(--field)]/35"
          style={{ borderTopLeftRadius: 8 }}
        />
        <h2 className="pl-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          Payments at the gate
        </h2>
      </div>
      <p className="mb-8 max-w-2xl text-base text-[var(--muted)] sm:text-lg">
        One Stallside QR. Shoppers pay how they want — cash today, Tap &amp; Go
        when you turn it on. Money goes to the stall owner, not Stallside.
        Availability depends on the stand&apos;s currency and the owner&apos;s
        payment setup.
      </p>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {METHODS.map((method) => (
          <li
            key={method.brand}
            className={`flex flex-col items-center gap-2 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-3 py-5 text-center ${
              method.status === "soon" ? "opacity-70" : ""
            }`}
          >
            {method.brand === "payid" ? (
              <span className="inline-flex h-12 w-full items-center justify-center rounded-[var(--radius)] bg-[var(--wash)] px-2">
                <PaymentBrandIcon brand="payid" className="size-7" />
              </span>
            ) : (
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-[var(--wash)] text-[var(--ink)]">
                <PaymentBrandIcon brand={method.brand} className="size-7" />
              </span>
            )}
            {method.brand === "payid" ? null : (
              <span className="text-sm font-semibold text-[var(--field)]">
                {method.label}
              </span>
            )}
            <span className="text-xs text-[var(--muted)]">{method.note}</span>
            <span className="text-xs font-medium text-[var(--field)]">
              {method.regions}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
