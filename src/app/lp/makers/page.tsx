import type { Metadata } from "next";
import LandingFooter from "@/components/LandingFooter";
import MakersLpAudienceStrip from "@/components/lp/makers/MakersLpAudienceStrip";
import MakersLpCommunity from "@/components/lp/makers/MakersLpCommunity";
import MakersLpFaq from "@/components/lp/makers/MakersLpFaq";
import MakersLpFinalCta from "@/components/lp/makers/MakersLpFinalCta";
import MakersLpHeader from "@/components/lp/makers/MakersLpHeader";
import MakersLpHero from "@/components/lp/makers/MakersLpHero";
import MakersLpMakers from "@/components/lp/makers/MakersLpMakers";
import MakersLpMarketing from "@/components/lp/makers/MakersLpMarketing";
import MakersLpPlatform from "@/components/lp/makers/MakersLpPlatform";
import MakersLpPricing from "@/components/lp/makers/MakersLpPricing";
import MakersLpProduction from "@/components/lp/makers/MakersLpProduction";
import MakersLpPayments from "@/components/lp/makers/MakersLpPayments";
import MakersLpSelling from "@/components/lp/makers/MakersLpSelling";
import MakersLpStands from "@/components/lp/makers/MakersLpStands";
import MakersLpSwitch from "@/components/lp/makers/MakersLpSwitch";
import { APP_SEO_DESCRIPTION, APP_SEO_TITLE } from "@/lib/constants";
import { DEFAULT_OG_IMAGE } from "@/lib/og-image";

const MAKERS_LP_PATH = "/lp/makers";

export const metadata: Metadata = {
  title: { absolute: APP_SEO_TITLE },
  description: APP_SEO_DESCRIPTION,
  robots: { index: false, follow: true },
  openGraph: {
    title: APP_SEO_TITLE,
    description: APP_SEO_DESCRIPTION,
    url: MAKERS_LP_PATH,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function MakersLpPage() {
  const showSocial = true;

  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-[#faf9f5] text-[var(--field)]">
      <MakersLpHeader />
      <main>
        <MakersLpHero />
        <MakersLpAudienceStrip />
        <MakersLpPlatform showSocial={showSocial} />
        <MakersLpProduction />
        <MakersLpSelling showSocial={showSocial} />
        <MakersLpMarketing showSocial={showSocial} />
        <MakersLpStands />
        <MakersLpPayments />
        <MakersLpMakers />
        <MakersLpSwitch />
        <MakersLpCommunity />
        <MakersLpPricing showSocial={showSocial} />
        <MakersLpFaq />
        <MakersLpFinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
