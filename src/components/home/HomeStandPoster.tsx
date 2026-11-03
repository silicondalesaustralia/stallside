import PaymentBrandIcon, { type PaymentBrand } from "@/components/PaymentBrandIcon";
import { HOME_HEADING_FONT } from "@/components/home/home-styles";

const POSTER_BRANDS: PaymentBrand[] = ["cash", "payid", "apple", "google", "card"];

/** The printable stand poster, laid over the stand photo at an angle. */
export default function HomeStandPoster({ qrSrc }: { qrSrc: string | null }) {
  return (
    <div className="absolute -bottom-8 left-[28%] w-[200px] rotate-[3deg] border border-[#d9d5c9] bg-[#fffdf7] p-4 text-center shadow-[0_18px_45px_#17361f30] sm:w-[230px] sm:p-5">
      <p className="text-[8px] font-semibold tracking-[0.14em] text-[var(--leaf)]">VENDL · SCAN TO PAY</p>
      <p className={`${HOME_HEADING_FONT} mt-1.5 text-[17px] leading-tight text-[var(--field)]`}>Green Valley Farm &amp; Bakes</p>
      <p className="mt-1 text-[10px] text-[var(--muted)]">Scan to browse and pay at this stand.</p>
      {qrSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qrSrc} alt="QR code for the Green Valley demo stand" className="mx-auto mt-3 size-[120px] sm:size-[140px]" />
      ) : (
        <div className="mx-auto mt-3 size-[120px] rounded bg-[var(--wash)] sm:size-[140px]" />
      )}
      <p className="mt-2 text-[8px] font-semibold tracking-[0.12em] text-[var(--muted)]">PAY WITH</p>
      <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[var(--field)]">
        {POSTER_BRANDS.map((brand) => (
          <span key={brand} className="flex h-5 w-7 items-center justify-center rounded border border-[var(--line)] bg-white">
            <PaymentBrandIcon brand={brand} className="h-3.5 max-w-[1.5rem]" />
          </span>
        ))}
      </div>
    </div>
  );
}
