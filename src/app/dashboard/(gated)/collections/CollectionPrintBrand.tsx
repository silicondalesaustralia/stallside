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
  const logoH = compact ? "6mm" : "10mm";
  const gap = compact ? "1.5mm" : "3mm";
  const nameSize = compact ? "8pt" : "14pt";

  return (
    <div
      className="flex items-center overflow-hidden"
      style={{ gap, maxHeight: logoH }}
    >
      {brand.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={brand.logoUrl}
          alt=""
          style={{
            height: logoH,
            width: "auto",
            maxWidth: compact ? "18mm" : "28mm",
            objectFit: "contain",
          }}
        />
      ) : null}
      <span
        className="truncate font-semibold leading-tight"
        style={{ fontSize: nameSize }}
      >
        {brand.name}
      </span>
    </div>
  );
}
