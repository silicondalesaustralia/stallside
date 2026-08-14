import type { Metadata } from "next";
import LpClosingCta from "@/components/lp/LpClosingCta";
import LpCtaParamScript from "@/components/lp/LpCtaParamScript";
import LpFooter from "@/components/lp/LpFooter";
import LpHeader from "@/components/lp/LpHeader";
import LpHero from "@/components/lp/LpHero";
import LpHowItWorks from "@/components/lp/LpHowItWorks";
import LpMissedSale from "@/components/lp/LpMissedSale";
import LpMobileStickyCta from "@/components/lp/LpMobileStickyCta";
import LpObjections from "@/components/lp/LpObjections";
import LpPaymentStrip from "@/components/lp/LpPaymentStrip";
import LpPricing from "@/components/lp/LpPricing";
import LpProductProof from "@/components/lp/LpProductProof";
import LpTestimonial from "@/components/lp/LpTestimonial";
import MarketingDashboardSection from "@/components/MarketingDashboardSection";

export const dynamic = "force-static";
export const revalidate = false;

export const metadata: Metadata = {
  title: "Stop Missing Farm Stall Sales",
  description:
    "Give your unattended stall a QR checkout so customers can pay by cash, PayID, card, Apple Pay or Google Pay. Create a free stall with no terminal.",
  robots: { index: false, follow: true },
};

export default function MissedSalesLpPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col bg-[var(--panel)] pb-20 md:pb-0">
      <LpHeader />
      <LpHero />
      <LpPaymentStrip />
      <LpMissedSale />
      <LpHowItWorks />
      <MarketingDashboardSection />
      <LpProductProof />
      <LpObjections />
      <LpTestimonial />
      <LpPricing />
      <LpClosingCta />
      <LpFooter />
      <LpMobileStickyCta />
      <LpCtaParamScript />
    </main>
  );
}
