/** Shared brand strip for printed collection lists and labels. */

export type PrintBrand = {
  name: string;
  logoUrl: string | null;
};

export default function CollectionPrintBrand({
  brand,
  compact = false,
}: {
  brand: PrintBrand;
  compact?: boolean;
}) {
  const logoH = compact ? 22 : 40;
  const logoMaxW = compact ? 72 : 120;

  return (
    <div
      className="collections-print-brand flex items-center"
      style={{ gap: compact ? 6 : 12 }}
    >
      {brand.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={brand.logoUrl}
          alt=""
          width={logoMaxW}
          height={logoH}
          style={{
            height: `${logoH}px`,
            width: "auto",
            maxWidth: `${logoMaxW}px`,
            objectFit: "contain",
          }}
        />
      ) : null}
      <span
        className="truncate font-semibold leading-tight"
        style={{ fontSize: compact ? "8pt" : "14pt" }}
      >
        {brand.name}
      </span>
    </div>
  );
}
