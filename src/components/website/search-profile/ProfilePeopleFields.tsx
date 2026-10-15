import type { BusinessProfile } from "@/lib/seo/business-profile";
import ProfileField, { profileInputClass } from "./ProfileField";
import ProfileSection from "./ProfileSection";

export default function ProfilePeopleFields({ profile }: { profile: BusinessProfile }) {
  const f = profile.founder;
  const r = profile.returnPolicy;
  return (
    <ProfileSection
      title="Owner & returns"
      intro="The owner is shown as the author of your blog posts. The return policy appears with your products in Google Shopping."
    >
      <ProfileField label="Owner / founder name" name="founderName" defaultValue={f?.name} />
      <ProfileField label="Role" name="founderJobTitle" defaultValue={f?.jobTitle} placeholder="Farmer & owner" />
      <ProfileField label="Short bio" name="founderDescription" multiline defaultValue={f?.description} />
      <ProfileField label="Photo link" name="founderImageUrl" type="url" defaultValue={f?.imageUrl} />
      <ProfileField
        label="Owner's profiles"
        name="founderSameAs"
        multiline
        defaultValue={f?.sameAs}
        hint="Their LinkedIn, Instagram etc., one per line."
      />
      <label className="block text-sm">
        <span className="font-medium">Returns</span>
        <select
          name="returnsAccepted"
          defaultValue={r ? (r.accepted ? "yes" : "no") : ""}
          className={profileInputClass}
        >
          <option value="">Not set</option>
          <option value="yes">Returns accepted</option>
          <option value="no">No returns (fresh food)</option>
        </select>
      </label>
      <ProfileField label="Return window (days)" name="returnsDays" type="number" defaultValue={r?.days} />
      <label className="flex items-center gap-2 self-center text-sm">
        <input type="checkbox" name="freeReturns" defaultChecked={r?.freeReturns} />
        Returns are free
      </label>
    </ProfileSection>
  );
}
