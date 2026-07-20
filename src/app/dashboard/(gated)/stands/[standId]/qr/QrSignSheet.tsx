import BrandLockup from "@/components/BrandLockup";
import type { PaymentBrand } from "@/components/PaymentBrandIcon";
import QrPaymentMethods from "@/components/QrPaymentMethods";
import SafeSignHtml from "@/components/SafeSignHtml";

export type QrSignSheetProps = {
  name: string;
  qrCallout: string | null;
  qrSignMessage: string | null;
  description: string | null;
  locationLabel: string | null;
  checkoutUrl: string;
  qrDataUrl: string;
  siteUrl: string;
  paymentBrands?: PaymentBrand[];
  className?: string;
  /** full = stacked A4; compact = side-by-side for half/quarter */
  layout?: "full" | "compact";
  /** Size-specific spacing (e.g. quarter logo ↔ name). */
  printSize?: "a4" | "half" | "quarter";
  /** When false, omit .qr-print-sheet so thumbnails are not the print source. */
  printable?: boolean;
};

const defaultMessage = "Scan to browse and pay at this stand.";

export default function QrSignSheet({
  name,
  qrCallout,
  qrSignMessage,
  description,
  locationLabel,
  checkoutUrl,
  qrDataUrl,
  siteUrl,
  paymentBrands = [],
  className = "",
  layout = "full",
  printSize,
  printable = true,
}: QrSignSheetProps) {
  const compact = layout === "compact";

  return (
    <div
      className={[
        printable ? "qr-print-sheet" : null,
        "relative overflow-hidden bg-[var(--panel)] text-center",
        compact
          ? "qr-print-sheet--compact px-3 py-3"
          : "px-6 pb-8 pt-12 print:px-10 print:pb-12 print:pt-16",
        printSize === "quarter" ? "qr-print-sheet--quarter" : null,
        printSize === "half" ? "qr-print-sheet--half" : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        aria-hidden
        className={`qr-sign-corner absolute left-3 top-3 border-l-[3px] border-t-[3px] border-[var(--field)] ${
          compact ? "size-6" : "size-10 sm:size-12"
        }`}
        style={{ borderTopLeftRadius: 10 }}
      />
      <div
        aria-hidden
        className={`qr-sign-corner absolute bottom-3 right-3 border-b-[3px] border-r-[3px] border-[var(--marigold)] ${
          compact ? "size-6" : "size-10 sm:size-12"
        }`}
        style={{ borderBottomRightRadius: 10 }}
      />

      <div className="qr-sign-head">
        <div className="flex justify-center">
          <BrandLockup link={false} size={compact ? "sm" : "lg"} />
        </div>
        <h1
          className={`font-[family-name:var(--font-display)] font-bold tracking-tight text-[var(--field)] ${
            compact ? "mt-1.5 text-xl" : "mt-8 text-3xl"
          }`}
        >
          {name}
        </h1>
        {qrCallout ? (
          <SafeSignHtml
            html={qrCallout}
            allowStyles
            className={`safe-sign-html qr-sign-callout text-center font-[family-name:var(--font-display)] font-bold leading-tight tracking-tight text-[var(--gone)] ${
              compact ? "mt-1.5 text-lg" : "mt-8 text-3xl"
            }`}
          />
        ) : null}
      </div>

      <div className="qr-sign-body">
        {qrSignMessage ? (
          <SafeSignHtml
            html={qrSignMessage}
            allowStyles
            className={`safe-sign-html text-[var(--muted)] ${compact ? "mt-0 text-sm" : "mt-6 text-lg"}`}
          />
        ) : (
          <p className={`text-[var(--muted)] ${compact ? "mt-0 text-sm" : "mt-6 text-lg"}`}>
            {defaultMessage}
          </p>
        )}
        {description ? (
          <SafeSignHtml
            html={description}
            allowStyles
            className={`safe-sign-html font-normal text-[var(--ink)] ${
              compact ? "mt-1.5 text-sm" : "mt-6 text-lg"
            }`}
          />
        ) : null}
        {locationLabel ? (
          <p className={`text-[var(--muted)] ${compact ? "mt-1 text-xs" : "mt-3 text-base"}`}>
            {locationLabel}
          </p>
        ) : null}
      </div>

      <div className="qr-sign-qr">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          alt={`QR code for ${name}`}
          className={`qr-sign-code mx-auto ${compact ? "mt-0 w-[42mm] max-w-[42mm]" : "mt-6 w-full max-w-[320px]"}`}
        />
      </div>

      <div className="qr-sign-foot">
        <QrPaymentMethods brands={paymentBrands} compact={compact} />
        <p
          className={`mx-auto break-all text-center font-receipt text-[var(--muted)] ${
            compact ? "mt-1 text-[9px] leading-tight" : "mt-4 text-xs"
          }`}
        >
          {checkoutUrl}
        </p>
        <p
          className={`mx-auto text-center font-[family-name:var(--font-display)] font-semibold tracking-tight text-[var(--field)] ${
            compact ? "mt-1 text-sm" : "mt-3 text-xl"
          }`}
        >
          {siteUrl}
        </p>
      </div>
    </div>
  );
}
