import CardNetworkIcon from "@/components/CardNetworkIcon";
import PaymentBrandIcon from "@/components/PaymentBrandIcon";

type RowItem =
  | { kind: "brand"; brand: "cash" | "apple" | "google" | "klarna" | "zip"; label: string; note?: string }
  | { kind: "network"; network: "visa" | "mastercard" | "amex"; label: string; note?: string }
  | { kind: "img"; src: string; label: string; note?: string };

const ROW: RowItem[] = [
  { kind: "brand", brand: "cash", label: "Cash" },
  { kind: "img", src: "/brand/payid.png", label: "PayID", note: "AU · free" },
  { kind: "img", src: "/brand/payto.png", label: "PayTo", note: "AU" },
  { kind: "network", network: "visa", label: "Visa" },
  { kind: "network", network: "mastercard", label: "Mastercard" },
  { kind: "network", network: "amex", label: "Amex" },
  { kind: "brand", brand: "apple", label: "Apple Pay" },
  { kind: "brand", brand: "google", label: "Google Pay" },
  { kind: "img", src: "/brand/link.png", label: "Link" },
  { kind: "brand", brand: "klarna", label: "Klarna" },
  { kind: "brand", brand: "zip", label: "Zip" },
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
                  <img
                    src={item.src}
                    alt=""
                    className="h-5 w-auto max-w-[2.5rem] object-contain"
                  />
                )}
              </span>
              <span className="text-center text-[11px] font-medium text-[var(--muted)]">
                {item.label}
                {item.note ? (
                  <span className="mt-0.5 block text-[10px] font-semibold text-[var(--leaf)]">
                    {item.note}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          No card reader. Payments happen on the customer&apos;s phone. PayID
          is Australia-only and always free of Stallside fees.
        </p>
      </div>
    </section>
  );
}
