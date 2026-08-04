import CardNetworkIcon from "@/components/CardNetworkIcon";
import PaymentBrandIcon from "@/components/PaymentBrandIcon";

const ROW = [
  { kind: "brand" as const, brand: "cash" as const, label: "Cash" },
  { kind: "img" as const, src: "/brand/payid.png", label: "PayID" },
  { kind: "network" as const, network: "visa" as const, label: "Visa" },
  { kind: "network" as const, network: "mastercard" as const, label: "Mastercard" },
  { kind: "network" as const, network: "amex" as const, label: "American Express" },
  { kind: "brand" as const, brand: "apple" as const, label: "Apple Pay" },
  { kind: "brand" as const, brand: "google" as const, label: "Google Pay" },
  { kind: "img" as const, src: "/brand/link.png", label: "Link" },
];

export default function LpPaymentStrip() {
  return (
    <section className="px-5 pb-10 sm:px-6 sm:pb-12">
      <div className="mx-auto max-w-6xl rounded-[var(--radius)] border border-[var(--line)] bg-white px-5 py-6 shadow-sm sm:px-8 sm:py-7">
        <p className="text-center text-sm font-semibold text-[var(--field)] sm:text-base">
          Let customers pay the way they already prefer
        </p>
        <ul className="mt-5 flex gap-4 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible">
          {ROW.map((item) => (
            <li
              key={item.label}
              className="flex shrink-0 flex-col items-center gap-1.5"
            >
              <span className="flex h-10 w-14 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--wash)] text-[var(--ink)]">
                {item.kind === "brand" ? (
                  <PaymentBrandIcon brand={item.brand} className="size-6" />
                ) : item.kind === "network" ? (
                  <CardNetworkIcon network={item.network} className="h-5 w-8" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.src} alt="" className="h-5 w-auto max-w-[2.5rem] object-contain" />
                )}
              </span>
              <span className="text-[11px] font-medium text-[var(--muted)]">
                {item.label}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          No card reader. Payments happen on the customer&apos;s phone.
        </p>
      </div>
    </section>
  );
}
