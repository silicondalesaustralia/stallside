import BrandLockup from "@/components/BrandLockup";
import { standAccentStyle } from "@/lib/stand-brand";

export type PreOrderQrSheetProps = {
  standName: string;
  pageTitle: string;
  collectionLabel: string;
  note: string | null;
  orderUrl: string;
  qrDataUrl: string;
  logoUrl?: string | null;
  accentColor?: string | null;
  secondaryColor?: string | null;
  className?: string;
  layout?: "full" | "compact";
  printSize?: "a4" | "half" | "quarter";
  printable?: boolean;
};

export default function PreOrderQrSheet({
  standName,
  pageTitle,
  collectionLabel,
  note,
  orderUrl,
  qrDataUrl,
  logoUrl = null,
  accentColor = null,
  secondaryColor = null,
  className = "",
  layout = "full",
  printSize,
  printable = true,
}: PreOrderQrSheetProps) {
  const compact = layout === "compact";
  const accentStyle = standAccentStyle(accentColor, secondaryColor);

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
      style={accentStyle}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-[var(--stand-accent,var(--leaf))]"
      />
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt=""
          className={`mx-auto object-contain ${compact ? "h-10" : "h-14"}`}
        />
      ) : (
        <div className="flex justify-center">
          <BrandLockup size={compact ? "sm" : "md"} />
        </div>
      )}
      <p
        className={`mt-4 font-[family-name:var(--font-display)] font-bold tracking-tight ${
          compact ? "text-xl" : "text-3xl"
        }`}
      >
        {standName}
      </p>
      <p
        className={`mt-3 font-[family-name:var(--font-display)] font-semibold text-[var(--leaf-dark)] ${
          compact ? "text-lg" : "text-2xl"
        }`}
      >
        {pageTitle}
      </p>
      <p
        className={`mt-2 font-semibold uppercase tracking-wide text-[var(--leaf)] ${
          compact ? "text-xs" : "text-sm"
        }`}
      >
        Pre-order · {collectionLabel}
      </p>
      <p className={`mt-3 text-[var(--muted)] ${compact ? "text-sm" : "text-base"}`}>
        Scan to order and pay ahead
      </p>
      {note ? (
        <p
          className={`mx-auto mt-3 max-w-md text-[var(--ink)] ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          {note}
        </p>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrDataUrl}
        alt={`QR code for ${pageTitle}`}
        className={`mx-auto mt-6 ${compact ? "size-36" : "size-52"}`}
      />
      <p className={`mt-3 break-all font-receipt text-[var(--muted)] ${compact ? "text-[10px]" : "text-xs"}`}>
        {orderUrl}
      </p>
    </div>
  );
}
