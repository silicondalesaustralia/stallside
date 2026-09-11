import { dashCtaClass } from "@/components/DashPrimaryCta";
import { saveStorefrontBranding } from "../actions";

const inputClass =
  "mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";

function ImageField({
  title,
  hint,
  name,
  removeName,
  url,
  emptyLabel,
  previewClass,
}: {
  title: string;
  hint: string;
  name: string;
  removeName: string;
  url: string | null;
  emptyLabel: string;
  previewClass: string;
}) {
  return (
    <div className="space-y-2 text-sm">
      <span className="font-medium text-[var(--field)]">{title}</span>
      <p className="text-xs text-[var(--muted)]">{hint}</p>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className={previewClass} />
      ) : (
        <p className="rounded-lg border border-dashed border-[var(--line)] px-3 py-6 text-center text-xs text-[var(--muted)]">
          {emptyLabel}
        </p>
      )}
      <input name={name} type="file" accept="image/*" className={inputClass} />
      {url ? (
        <label className="flex items-center gap-2">
          <input type="checkbox" name={removeName} />
          Remove current {title.toLowerCase()}
        </label>
      ) : null}
    </div>
  );
}

export default function BrandingForm({
  logoUrl,
  faviconUrl,
  heroImageUrl,
}: {
  logoUrl: string | null;
  faviconUrl: string | null;
  heroImageUrl: string | null;
}) {
  return (
    <form
      action={saveStorefrontBranding}
      encType="multipart/form-data"
      className="space-y-6 rounded-2xl border border-[var(--line)] bg-white p-5"
    >
      <ImageField
        title="Logo"
        hint="Shown in your site header, stall, and QR materials."
        name="logo"
        removeName="removeLogo"
        url={logoUrl}
        emptyLabel="No logo yet — or use a text wordmark from AI later"
        previewClass="mt-2 max-h-24 max-w-xs object-contain"
      />
      <ImageField
        title="Favicon"
        hint="Small icon in the browser tab. Square PNG works best."
        name="favicon"
        removeName="removeFavicon"
        url={faviconUrl}
        emptyLabel="No favicon yet"
        previewClass="mt-2 h-12 w-12 rounded object-contain"
      />
      <ImageField
        title="Hero image"
        hint="Homepage hero. AI can also generate decorative placeholders next."
        name="heroImage"
        removeName="removeHero"
        url={heroImageUrl}
        emptyLabel="No hero image yet"
        previewClass="mt-2 max-h-48 w-full rounded-xl object-cover"
      />
      <button type="submit" className={dashCtaClass}>
        Save branding
      </button>
    </form>
  );
}
