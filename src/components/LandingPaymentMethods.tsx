import LandingPaymentMarquee from "@/components/LandingPaymentMarquee";

/** Homepage payment-methods block - text first; scrolling regional marks. */
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
        Cash, cards, Tap &amp; Go, and wallets everywhere we operate - plus
        region extras like PayID and PayTo in Australia, and Cash App in the US.
        Buy Now, Pay Later with Zip and Klarna on larger orders. One QR, the
        methods that fit your country.
      </p>
      <div className="mt-6">
        <LandingPaymentMarquee />
      </div>
      <p className="mt-3 text-xs text-[var(--muted)]">
        Flagged icons are country-specific. Card networks and wallets work across
        AU, US, UK and EU stands.
      </p>
    </section>
  );
}
