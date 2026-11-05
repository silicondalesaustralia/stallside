import type { Metadata } from "next";
import { headers } from "next/headers";
import LandingFooter from "@/components/LandingFooter";
import MakersLpBenefits from "@/components/lp/makers/MakersLpBenefits";
import MakersLpCommunity from "@/components/lp/makers/MakersLpCommunity";
import MakersLpCurrencyProvider from "@/components/lp/makers/MakersLpCurrencyProvider";
import MakersLpDecision from "@/components/lp/makers/MakersLpDecision";
import MakersLpFaq from "@/components/lp/makers/MakersLpFaq";
import MakersLpFeatures from "@/components/lp/makers/MakersLpFeatures";
import MakersLpFinalCta from "@/components/lp/makers/MakersLpFinalCta";
import MakersLpHeader from "@/components/lp/makers/MakersLpHeader";
import MakersLpHero from "@/components/lp/makers/MakersLpHero";
import MakersLpMakers from "@/components/lp/makers/MakersLpMakers";
import MakersLpMarketing from "@/components/lp/makers/MakersLpMarketing";
import MakersLpMobileApps from "@/components/lp/makers/MakersLpMobileApps";
import MakersLpPayments from "@/components/lp/makers/MakersLpPayments";
import MakersLpPlatform from "@/components/lp/makers/MakersLpPlatform";
import MakersLpPricing from "@/components/lp/makers/MakersLpPricing";
import MakersLpProUpgrade from "@/components/lp/makers/MakersLpProUpgrade";
import MakersLpProduction from "@/components/lp/makers/MakersLpProduction";
import MakersLpRiskReversal from "@/components/lp/makers/MakersLpRiskReversal";
import MakersLpStands from "@/components/lp/makers/MakersLpStands";
import MakersLpSwitch from "@/components/lp/makers/MakersLpSwitch";
import LpCtaClickTracker from "@/components/lp/LpCtaClickTracker";
import LpCtaParamScript from "@/components/lp/LpCtaParamScript";
import { MAKERS_LP_CAMPAIGN, MAKERS_LP_PATH } from "@/lib/makers-lp";
import { lpCurrencyFromRequest } from "@/lib/makers-lp-price";
import { DEFAULT_OG_IMAGE } from "@/lib/og-image";
import { listProAnnualCurrencies } from "@/lib/stripe-pro-annual";

const title = "Vendl for Makers | Selling Software That Understands How Makers Work";
const description =
  "From making and pricing your products to managing stock, orders and online sales, Vendl brings your business together in one place. Start free.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  robots: { index: false, follow: true },
  openGraph: { title, description, url: MAKERS_LP_PATH, images: [DEFAULT_OG_IMAGE] },
};

export default async function MakersLpPage() {
  const showSocial = true;
  const requestHeaders = await headers();
  const initialCurrency = lpCurrencyFromRequest(
    requestHeaders.get("x-vercel-ip-country"),
    requestHeaders.get("accept-language"),
  );

  return (
    <MakersLpCurrencyProvider initial={initialCurrency}>
      <div className="relative flex min-h-full flex-1 flex-col overflow-x-clip bg-[#faf9f5] text-[var(--field)] [--muted:#46573f]">
        <MakersLpHeader />
        <main>
          <MakersLpHero />
          <MakersLpBenefits />
          <MakersLpFeatures />
          <MakersLpStands />
          <MakersLpSwitch />
          <MakersLpPlatform showSocial={showSocial} />
          <MakersLpProduction />
          <MakersLpMakers />
          <MakersLpCommunity />
          <MakersLpMarketing showSocial={showSocial} />
          <MakersLpProUpgrade />
          <MakersLpDecision />
          <MakersLpPricing showSocial={showSocial} annualCurrencies={listProAnnualCurrencies()} />
          <MakersLpPayments />
          <MakersLpRiskReversal />
          <MakersLpFaq />
          <MakersLpMobileApps />
          <MakersLpFinalCta />
        </main>
        <LandingFooter />
        <LpCtaParamScript />
        <LpCtaClickTracker campaign={MAKERS_LP_CAMPAIGN} />
      </div>
    </MakersLpCurrencyProvider>
  );
}
