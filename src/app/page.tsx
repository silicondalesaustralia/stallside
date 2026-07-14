import FeatureLists from "@/components/FeatureLists";
import HowItWorks from "@/components/HowItWorks";
import LandingFooter from "@/components/LandingFooter";
import LandingHero from "@/components/LandingHero";
import NetworkVision from "@/components/NetworkVision";
import PricingTiers from "@/components/PricingTiers";
import UseCases from "@/components/UseCases";

export default function HomePage() {
  return (
    <main className="relative flex min-h-full flex-1 flex-col">
      <LandingHero />
      <HowItWorks />
      <UseCases />
      <FeatureLists />
      <PricingTiers />
      <NetworkVision />
      <LandingFooter />
    </main>
  );
}
