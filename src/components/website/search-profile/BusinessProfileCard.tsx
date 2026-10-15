import { dashCtaClass } from "@/components/DashPrimaryCta";
import { saveBusinessProfile } from "@/app/dashboard/(gated)/website/business-profile-actions";
import type { BusinessProfile } from "@/lib/seo/business-profile";
import type { BusinessTypeId } from "@/lib/seo/business-types";
import ProfileIdentityFields from "./ProfileIdentityFields";
import ProfileLocationFields from "./ProfileLocationFields";
import ProfileHoursFields from "./ProfileHoursFields";
import ProfileLinksFields from "./ProfileLinksFields";
import ProfilePeopleFields from "./ProfilePeopleFields";
import ProfileJsonLdPreview from "./ProfileJsonLdPreview";

type Props = {
  profile: BusinessProfile;
  defaultType: BusinessTypeId;
  graph: Record<string, unknown>;
  liveUrl: string;
  isPublished: boolean;
  flash: { saved: boolean; error?: string };
};

/** Business details › Google & search profile: feeds the schema.org markup on every page. */
export default function BusinessProfileCard({ profile, defaultType, graph, liveUrl, isPublished, flash }: Props) {
  return (
    <section id="search-profile" className="space-y-4 rounded-2xl border border-[var(--line)] bg-white p-5">
      <div>
        <h2 className="text-lg font-bold text-[var(--field)]">Google & search profile</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Helps Google understand your business for Maps, local results, shopping listings and rich results.
          Everything is optional — fill in what you have. Changes go live as soon as you save.
        </p>
      </div>
      {flash.saved ? <p className="text-sm font-medium text-[var(--ok)]">Search profile saved.</p> : null}
      {flash.error ? <p className="text-sm font-medium text-[var(--gone)]">{flash.error}</p> : null}
      <form action={saveBusinessProfile} className="space-y-3">
        <ProfileIdentityFields profile={profile} defaultType={defaultType} />
        <ProfileLinksFields profile={profile} />
        <ProfileLocationFields profile={profile} />
        <ProfileHoursFields profile={profile} />
        <ProfilePeopleFields profile={profile} />
        <button type="submit" className={dashCtaClass}>
          Save search profile
        </button>
      </form>
      <ProfileJsonLdPreview graph={graph} liveUrl={liveUrl} isPublished={isPublished} />
    </section>
  );
}
