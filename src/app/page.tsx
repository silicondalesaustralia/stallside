import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import LandingFooter from "@/components/LandingFooter";
import HomeAudienceStrip from "@/components/home/HomeAudienceStrip";
import HomeCommunity from "@/components/home/HomeCommunity";
import HomeFaq from "@/components/home/HomeFaq";
import HomeFinalCta from "@/components/home/HomeFinalCta";
import HomeHeader from "@/components/home/HomeHeader";
import HomeHero from "@/components/home/HomeHero";
import HomeMakers from "@/components/home/HomeMakers";
import HomeMarketing from "@/components/home/HomeMarketing";
import HomePlatform from "@/components/home/HomePlatform";
import HomePricing from "@/components/home/HomePricing";
import HomeProduction from "@/components/home/HomeProduction";
import HomePayments from "@/components/home/HomePayments";
import HomeSelling from "@/components/home/HomeSelling";
import HomeStands from "@/components/home/HomeStands";
import HomeSwitch from "@/components/home/HomeSwitch";
import { APP_SEO_DESCRIPTION, APP_SEO_TITLE } from "@/lib/constants";
import { HOME_FAQS } from "@/lib/home-faqs";
import { homeGraphSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: { absolute: APP_SEO_TITLE },
  description: APP_SEO_DESCRIPTION,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const showSocial = true;

  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-[#faf9f5] text-[var(--field)]">
      <JsonLd data={homeGraphSchema(HOME_FAQS)} />
      <HomeHeader />
      <main>
        <HomeHero />
        <HomeAudienceStrip />
        <HomePlatform showSocial={showSocial} />
        <HomeProduction />
        <HomeSelling showSocial={showSocial} />
        <HomeMarketing showSocial={showSocial} />
        <HomeStands />
        <HomePayments />
        <HomeMakers />
        <HomeSwitch />
        <HomeCommunity />
        <HomePricing showSocial={showSocial} />
        <HomeFaq />
        <HomeFinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
