import type { BusinessProfile } from "@/lib/seo/business-profile";
import ProfileField from "./ProfileField";
import ProfileSection from "./ProfileSection";

export default function ProfileLinksFields({ profile }: { profile: BusinessProfile }) {
  return (
    <ProfileSection
      title="Google profile, links & expertise"
      intro="Links prove these profiles are the same business (schema.org sameAs). Your Instagram, Facebook, TikTok and YouTube from the storefront are added automatically."
      open
    >
      <ProfileField
        label="Google Business Profile link"
        name="googleBusinessProfileUrl"
        type="url"
        defaultValue={profile.googleBusinessProfileUrl}
        placeholder="https://g.page/your-business"
        hint="In Google Maps: open your business › Share › Copy link."
      />
      <ProfileField
        label="Other profiles & listings"
        name="sameAs"
        multiline
        defaultValue={profile.sameAs}
        placeholder={"https://www.tripadvisor.com/…\nhttps://www.yelp.com/…"}
        hint="One link per line: market listings, Tripadvisor, Yelp, LinkedIn, Wikipedia, directories."
      />
      <ProfileField
        label="What you're known for"
        name="knowsAbout"
        multiline
        defaultValue={profile.knowsAbout}
        placeholder={"Sourdough\nHeirloom tomatoes\nFree-range eggs"}
        hint="Topics and products you're expert in (knowsAbout), one per line."
      />
      <ProfileField
        label="Awards"
        name="awards"
        multiline
        defaultValue={profile.awards}
        placeholder="Gold medal, Sydney Royal Fine Food Show 2024"
      />
      <ProfileField
        label="Certifications"
        name="certifications"
        multiline
        defaultValue={profile.certifications}
        placeholder="Certified organic (ACO)"
      />
      <ProfileField
        label="Member of"
        name="memberOf"
        multiline
        defaultValue={profile.memberOf}
        placeholder="Australian Farmers' Markets Association"
        hint="Associations, co-ops, markets you belong to."
      />
    </ProfileSection>
  );
}
