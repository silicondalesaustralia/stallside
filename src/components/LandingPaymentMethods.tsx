import PaymentIconRow from "@/components/PaymentIconRow";

/** Homepage payment-methods block - text first; BNPL as “and also”, on larger orders. */
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
          Every way your customers want to pay
        </h2>
      </div>
      <p className="max-w-2xl text-base text-[var(--muted)] sm:text-lg">
        Cash, PayID, card, Tap &amp; Go, Apple Pay, Google Pay and PayTo
        (Australia) - plus Buy Now, Pay Later with Afterpay, Zip and Klarna on
        larger orders. One QR, every option.
      </p>
      <div className="mt-6 pl-3">
        <PaymentIconRow
          brands={[
            "cash",
            "payid",
            "card",
            "apple",
            "google",
            "payto",
            "afterpay",
            "zip",
            "klarna",
          ]}
          className="gap-2.5"
        />
      </div>
    </section>
  );
}
