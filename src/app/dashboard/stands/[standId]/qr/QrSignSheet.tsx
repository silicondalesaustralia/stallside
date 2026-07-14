import BrandLockup from "@/components/BrandLockup";
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
  className?: string;
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
  className = "",
}: QrSignSheetProps) {
  return (
    <div
      className={`relative overflow-hidden bg-[var(--panel)] px-6 pb-8 pt-12 text-center print:overflow-hidden print:rounded-none print:border-0 print:bg-white print:px-10 print:pb-12 print:pt-16 ${className}`}
    >
      <div
        aria-hidden
        className="absolute left-4 top-4 size-10 border-l-[4px] border-t-[4px] border-[var(--field)] sm:size-12"
        style={{ borderTopLeftRadius: 10 }}
      />
      <div
        aria-hidden
        className="absolute bottom-4 right-4 size-10 border-b-[4px] border-r-[4px] border-[var(--marigold)] sm:size-12"
        style={{ borderBottomRightRadius: 10 }}
      />
      <div className="flex justify-center">
        <BrandLockup link={false} size="lg" />
      </div>
      {qrCallout ? (
        <SafeSignHtml
          html={qrCallout}
          allowStyles
          className="safe-sign-html mt-8 text-center font-[family-name:var(--font-display)] text-3xl font-bold leading-tight tracking-tight text-[var(--gone)]"
        />
      ) : null}
      <h1 className="mt-8 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)]">
        {name}
      </h1>
      {qrSignMessage ? (
        <SafeSignHtml
          html={qrSignMessage}
          allowStyles
          className="safe-sign-html mt-6 text-lg text-[var(--muted)]"
        />
      ) : (
        <p className="mt-6 text-lg text-[var(--muted)]">{defaultMessage}</p>
      )}
      {description ? (
        <SafeSignHtml
          html={description}
          allowStyles
          className="safe-sign-html mt-6 text-lg font-normal text-[var(--ink)]"
        />
      ) : null}
      {locationLabel ? (
        <p className="mt-3 text-base text-[var(--muted)]">{locationLabel}</p>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrDataUrl}
        alt={`QR code for ${name}`}
        className="mx-auto mt-6 w-full max-w-[320px]"
      />
      <p className="mt-4 break-all font-receipt text-xs text-[var(--muted)]">{checkoutUrl}</p>
      <p className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--field)]">
        {siteUrl}
      </p>
    </div>
  );
}
