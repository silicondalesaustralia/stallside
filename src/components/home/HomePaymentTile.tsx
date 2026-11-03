import CardNetworkIcon from "@/components/CardNetworkIcon";
import PaymentBrandIcon from "@/components/PaymentBrandIcon";
import type { HomePayMark } from "@/lib/home-payments";

export default function HomePaymentTile({ mark, large = false }: { mark: HomePayMark; large?: boolean }) {
  return (
    <li className="flex shrink-0 flex-col items-center gap-1.5">
      <span
        className={`flex items-center justify-center rounded-lg border border-[var(--line)] bg-white text-[var(--ink)] ${
          large ? "h-14 w-24" : "h-11 w-16"
        }`}
      >
        {mark.kind === "brand" ? (
          <PaymentBrandIcon brand={mark.brand} className={large ? "size-9" : "size-6"} />
        ) : mark.kind === "network" ? (
          <CardNetworkIcon network={mark.network} className="h-5 w-8" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mark.src} alt="" className="h-6 w-auto max-w-[3.25rem] object-contain" />
        )}
      </span>
      <span className="text-center text-[11px] font-medium text-[var(--muted)]">
        {mark.label}
        {mark.note ? <span className="block text-[10px] font-semibold text-[var(--leaf)]">{mark.note}</span> : null}
      </span>
    </li>
  );
}
