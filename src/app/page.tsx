import type { Metadata } from "next";
import CardDemandProof from "@/components/CardDemandProof";
import FeatureColumns from "@/components/FeatureColumns";
import HowItWorksFlow from "@/components/HowItWorksFlow";
import JsonLd from "@/components/JsonLd";
import LandingFaq from "@/components/LandingFaq";
import LandingFooter from "@/components/LandingFooter";
import LandingHero from "@/components/LandingHero";
import LandingPaymentMethods from "@/components/LandingPaymentMethods";
import LandingRegionsSection from "@/components/LandingRegionsSection";
import MarketingDashboardSection from "@/components/MarketingDashboardSection";
import NetworkVision from "@/components/NetworkVision";
import PricingTiers from "@/components/PricingTiers";
import ProductFork from "@/components/ProductFork";
import RestockCustomersSection from "@/components/RestockCustomersSection";
import StandBrandingSection from "@/components/StandBrandingSection";
import TrustSection from "@/components/TrustSection";
import UseCaseGrid from "@/components/UseCaseGrid";
import { APP_SEO_DESCRIPTION, APP_SEO_TITLE } from "@/lib/constants";
import { LANDING_FAQS } from "@/lib/landing-faqs";
import { homeGraphSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: { absolute: APP_SEO_TITLE },
  description: APP_SEO_DESCRIPTION,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <main className="relative flex min-h-full flex-1 flex-col">
      <JsonLd data={homeGraphSchema(LANDING_FAQS)} />
      <LandingHero />
      <ProductFork />
      <TrustSection />
      <HowItWorksFlow />
      <MarketingDashboardSection />
      <UseCaseGrid />
      <LandingPaymentMethods />
      <LandingRegionsSection />
      <RestockCustomersSection />
      <StandBrandingSection />
      <FeatureColumns />
      <CardDemandProof />
      <PricingTiers />
      <NetworkVision />
      <LandingFaq />
      <LandingFooter />
    </main>
  );
}
