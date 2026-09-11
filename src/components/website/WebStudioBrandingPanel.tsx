import BrandingForm from "@/app/dashboard/(gated)/website/branding/BrandingForm";

type Props = {
  logoUrl: string | null;
  faviconUrl: string | null;
  heroImageUrl: string | null;
  accentColor: string;
  secondaryColor: string;
  fontPairId?: string | null;
  flash?: { saved?: boolean; error?: boolean };
};

export default function WebStudioBrandingPanel({
  logoUrl,
  faviconUrl,
  heroImageUrl,
  accentColor,
  secondaryColor,
  fontPairId,
  flash,
}: Props) {
  return (
    <>
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          Branding
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Logo, colours, fonts, favicon and hero. Change these anytime — AI uses them when
          recommending looks.
        </p>
      </div>

      {flash?.saved ? (
        <p className="text-sm font-medium text-[var(--ok)]">Branding saved.</p>
      ) : null}
      {flash?.error ? (
        <p className="text-sm font-medium text-red-700">
          Couldn&apos;t save branding. Try another image.
        </p>
      ) : null}

      <BrandingForm
        key={`branding-${logoUrl ?? ""}-${faviconUrl ?? ""}-${heroImageUrl ?? ""}-${fontPairId ?? ""}`}
        logoUrl={logoUrl}
        faviconUrl={faviconUrl}
        heroImageUrl={heroImageUrl}
        accentColor={accentColor}
        secondaryColor={secondaryColor}
        fontPairId={fontPairId}
      />

      <p className="text-sm text-[var(--muted)]">
        Next: open the AI builder tab to draft your site, or skip to Edit layout.
      </p>
    </>
  );
}
