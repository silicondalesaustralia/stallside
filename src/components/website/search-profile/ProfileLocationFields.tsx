import type { BusinessProfile } from "@/lib/seo/business-profile";
import { PROFILE_COUNTRIES } from "@/lib/seo/countries";
import ProfileField, { profileInputClass } from "./ProfileField";
import ProfileSection from "./ProfileSection";

export default function ProfileLocationFields({ profile }: { profile: BusinessProfile }) {
  const a = profile.address;
  return (
    <ProfileSection
      title="Location & contact"
      intro="Match these exactly to your Google Business Profile — the same name, address and phone everywhere builds trust with Google."
    >
      <ProfileField label="Street address" name="street" defaultValue={a?.street} />
      <ProfileField label="Suburb / town" name="locality" defaultValue={a?.locality} />
      <ProfileField label="State" name="region" defaultValue={a?.region} placeholder="NSW" />
      <ProfileField label="Postcode" name="postcode" defaultValue={a?.postcode} />
      <label className="block text-sm">
        <span className="font-medium">Country</span>
        <select name="country" defaultValue={a?.country ?? "AU"} className={profileInputClass}>
          {a?.country && !PROFILE_COUNTRIES.some((c) => c.code === a.country) ? (
            <option value={a.country}>{a.country}</option>
          ) : null}
          {PROFILE_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-start gap-2 self-center text-sm">
        <input type="checkbox" name="showStreetAddress" defaultChecked={profile.showStreetAddress} className="mt-1" />
        <span>
          Publish my street address
          <span className="block text-xs text-[var(--muted)]">Leave off if you sell from home — only suburb and postcode are shown.</span>
        </span>
      </label>
      <ProfileField label="Latitude" name="lat" type="number" step="any" defaultValue={profile.geo?.lat} />
      <ProfileField label="Longitude" name="lng" type="number" step="any" defaultValue={profile.geo?.lng} />
      <ProfileField
        label="Areas you serve"
        name="areaServed"
        multiline
        defaultValue={profile.areaServed}
        hint="Suburbs or regions you deliver to, one per line."
      />
      <ProfileField label="Google Maps link" name="mapUrl" type="url" defaultValue={profile.mapUrl} placeholder="https://maps.app.goo.gl/…" />
      <ProfileField label="Public phone" name="phone" type="tel" defaultValue={profile.phone} hint="Blank uses your shop phone if shown." />
      <ProfileField label="Public email" name="email" type="email" defaultValue={profile.email} hint="Blank uses your contact email." />
    </ProfileSection>
  );
}
