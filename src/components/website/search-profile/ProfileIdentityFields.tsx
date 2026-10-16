import { BUSINESS_TYPES, BUSINESS_TYPE_IDS, type BusinessTypeId } from "@/lib/seo/business-types";
import { PRICE_RANGES, type BusinessProfile } from "@/lib/seo/business-profile";
import ProfileField, { profileInputClass } from "./ProfileField";
import ProfileSection from "./ProfileSection";

const PRICE_RANGE_LABELS: Record<(typeof PRICE_RANGES)[number], string> = {
  $: "Budget / inexpensive",
  $$: "Moderate / average",
  $$$: "Above average",
  $$$$: "Premium / luxury",
};

export default function ProfileIdentityFields({
  profile,
  defaultType,
}: {
  profile: BusinessProfile;
  defaultType: BusinessTypeId;
}) {
  return (
    <ProfileSection
      title="Business type & identity"
      intro="Tells Google what kind of business you are, so you can appear in local and shopping results."
      open
    >
      <label className="block text-sm">
        <span className="font-medium">Business type</span>
        <select name="businessType" defaultValue={profile.businessType ?? defaultType} className={profileInputClass}>
          {BUSINESS_TYPE_IDS.map((id) => (
            <option key={id} value={id}>
              {BUSINESS_TYPES[id].label}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-xs text-[var(--muted)]">
          Local types show your address, hours and map; pick &quot;Online-only&quot; if customers never visit.
        </span>
      </label>
      <ProfileField label="Registered business name" name="legalName" defaultValue={profile.legalName} placeholder="Green Acres Pty Ltd" />
      <ProfileField
        label="Other names people search for"
        name="alternateNames"
        multiline
        defaultValue={profile.alternateNames}
        hint="One per line, e.g. a shortened name or old trading name."
      />
      <ProfileField label="Slogan" name="slogan" defaultValue={profile.slogan} />
      <ProfileField
        label="Search description"
        name="description"
        multiline
        defaultValue={profile.description}
        hint="1–2 sentences. Leave blank to use your About text."
      />
      <ProfileField label="Founded" name="foundingDate" defaultValue={profile.foundingDate} placeholder="2015" hint="Year, or YYYY-MM-DD." />
      <ProfileField
        label="ABN / tax ID (optional)"
        name="taxId"
        defaultValue={profile.taxId}
        hint="Leave blank if you don't have one."
      />
      <label className="block text-sm">
        <span className="font-medium">Price range (optional)</span>
        <select name="priceRange" defaultValue={profile.priceRange ?? ""} className={profileInputClass}>
          <option value="">Not set</option>
          {PRICE_RANGES.map((r) => (
            <option key={r} value={r}>
              {r} — {PRICE_RANGE_LABELS[r]}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-xs text-[var(--muted)]">
          How your prices compare with similar businesses nearby. Google shows this next to your listing.
        </span>
      </label>
      <ProfileField
        label="Payment accepted"
        name="paymentAccepted"
        defaultValue={profile.paymentAccepted?.join(", ")}
        placeholder="Cash, Credit card, Bank transfer"
      />
    </ProfileSection>
  );
}
