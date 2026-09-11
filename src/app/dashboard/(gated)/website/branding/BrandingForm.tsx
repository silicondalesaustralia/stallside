import { dashCtaClass } from "@/components/DashPrimaryCta";
import { saveStorefrontBranding } from "../actions";

const inputClass =
  "mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";

export default function BrandingForm({
  heroImageUrl,
}: {
  heroImageUrl: string | null;
}) {
  return (
    <form
      action={saveStorefrontBranding}
      encType="multipart/form-data"
      className="space-y-5 rounded-2xl border border-[var(--line)] bg-white p-5"
    >
      <div className="space-y-2 text-sm">
        <span className="font-medium text-[var(--field)]">Hero image</span>
        <p className="text-xs text-[var(--muted)]">
          Used on your homepage hero. You can also let AI generate decorative
          placeholders in the next step.
        </p>
        {heroImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImageUrl}
            alt=""
            className="mt-2 max-h-48 w-full rounded-xl object-cover"
          />
        ) : (
          <p className="rounded-lg border border-dashed border-[var(--line)] px-3 py-8 text-center text-xs text-[var(--muted)]">
            No hero image yet
          </p>
        )}
        <input name="heroImage" type="file" accept="image/*" className={inputClass} />
        {heroImageUrl ? (
          <label className="flex items-center gap-2">
            <input type="checkbox" name="removeHero" />
            Remove current hero image
          </label>
        ) : null}
      </div>
      <button type="submit" className={dashCtaClass}>
        Save branding
      </button>
    </form>
  );
}
