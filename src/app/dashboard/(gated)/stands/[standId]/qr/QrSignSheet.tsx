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
  /** full = stacked A4; compact = text + QR side-by-side for half/quarter */
  layout?: "full" | "compact";
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
}: QrSignSheetProps) {
  const compact = layout === "compact";

  return (
    <div
      className={[
        "qr-print-sheet relative overflow-hidden bg-[var(--panel)] text-center",
        compact
          ? "qr-print-sheet--compact px-3 py-3"
          : "px-6 pb-8 pt-12 print:px-10 print:pb-12 print:pt-16",
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
        {qrCallout ? (
          <SafeSignHtml
            html={qrCallout}
            allowStyles
            className={`safe-sign-html qr-sign-callout text-center font-[family-name:var(--font-display)] font-bold leading-tight tracking-tight text-[var(--gone)] ${
              compact ? "mt-2 text-lg" : "mt-8 text-3xl"
            }`}
          />
        ) : null}
        <h1
          className={`font-[family-name:var(--font-display)] font-bold tracking-tight text-[var(--field)] ${
            compact ? "mt-2 text-xl" : "mt-8 text-3xl"
          }`}
        >
          {name}
        </h1>
      </div>

      <div className="qr-sign-body">
        {qrSignMessage ? (
          <SafeSignHtml
            html={qrSignMessage}
            allowStyles
            className={`safe-sign-html text-[var(--muted)] ${compact ? "mt-2 text-sm" : "mt-6 text-lg"}`}
          />
        ) : (
          <p className={`text-[var(--muted)] ${compact ? "mt-2 text-sm" : "mt-6 text-lg"}`}>
            {defaultMessage}
          </p>
        )}
        {description ? (
          <SafeSignHtml
            html={description}
            allowStyles
            className={`safe-sign-html font-normal text-[var(--ink)] ${
              compact ? "mt-2 text-sm" : "mt-6 text-lg"
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
        <QrPaymentMethods brands={paymentBrands} compact={compact} />
        <p
          className={`break-all font-receipt text-[var(--muted)] ${
            compact ? "mt-1 text-[9px] leading-tight" : "mt-4 text-xs"
          }`}
        >
          {checkoutUrl}
        </p>
        <p
          className={`font-[family-name:var(--font-display)] font-semibold tracking-tight text-[var(--field)] ${
            compact ? "mt-1 text-sm" : "mt-3 text-xl"
          }`}
        >
          {siteUrl}
        </p>
      </div>
    </div>
  );
}
