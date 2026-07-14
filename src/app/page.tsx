import FeatureColumns from "@/components/FeatureColumns";
import HowItWorksFlow from "@/components/HowItWorksFlow";
import LandingFooter from "@/components/LandingFooter";
import LandingHero from "@/components/LandingHero";
import NetworkVision from "@/components/NetworkVision";
import PricingTiers from "@/components/PricingTiers";
import UseCaseGrid from "@/components/UseCaseGrid";

export default function HomePage() {
  return (
    <main className="relative flex min-h-full flex-1 flex-col">
      <LandingHero />
      <HowItWorksFlow />
      <UseCaseGrid />
      <FeatureColumns />
      <PricingTiers />
      <NetworkVision />
      <LandingFooter />
    </main>
  );
}
