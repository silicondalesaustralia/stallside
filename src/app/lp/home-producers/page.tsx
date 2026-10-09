import type { Metadata } from "next";
import CampaignFooter from "@/components/lp/home-producers/CampaignFooter";
import CollectionPreview from "@/components/lp/home-producers/CollectionPreview";
import FeaturesIncluded from "@/components/lp/home-producers/FeaturesIncluded";
import FounderStory from "@/components/lp/home-producers/FounderStory";
import FreeAccountOffer from "@/components/lp/home-producers/FreeAccountOffer";
import HomeProducerHero from "@/components/lp/home-producers/HomeProducerHero";
import ProducerProof from "@/components/lp/home-producers/ProducerProof";
import ProducerStories from "@/components/lp/home-producers/ProducerStories";
import RevenueBenefits from "@/components/lp/home-producers/RevenueBenefits";
import LpCtaClickTracker from "@/components/lp/LpCtaClickTracker";
import LpCtaParamScript from "@/components/lp/LpCtaParamScript";
import LpMobileStickyCta from "@/components/lp/LpMobileStickyCta";
import {
  GOLD_CTA_COMPACT_CLASS,
  HOME_PRODUCERS_COPY,
  HOME_PRODUCERS_LP_PATH,
  HOME_PRODUCERS_SIGNUP_HREF,
} from "@/lib/home-producers-lp";
import { DEFAULT_OG_IMAGE } from "@/lib/og-image";

export const dynamic = "force-static";
export const revalidate = false;

const title = "Vendl for Home Producers | Pre-Orders & Subscriptions";
const description =
  "Sell what you bake, grow or make with Vendl. Take pre-orders, offer extras and manage regular subscriptions. Start with a free account.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  robots: { index: false, follow: true },
  openGraph: {
    title,
    description,
    url: HOME_PRODUCERS_LP_PATH,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function HomeProducersLpPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col overflow-x-clip bg-[var(--wash)] pb-20 md:pb-0">
      <HomeProducerHero />
      <ProducerProof />
      <RevenueBenefits />
      <CollectionPreview />
      <ProducerStories />
      <FeaturesIncluded />
      <FounderStory />
      <FreeAccountOffer />
      <CampaignFooter />
      <LpMobileStickyCta
        placement="sticky"
        priceLabel={HOME_PRODUCERS_COPY.freePriceLabel}
        ctaLabel={HOME_PRODUCERS_COPY.ctaLabel}
        signupHref={HOME_PRODUCERS_SIGNUP_HREF}
        ctaClassName={GOLD_CTA_COMPACT_CLASS}
      />
      <LpCtaParamScript />
      <LpCtaClickTracker campaign="home_producers" />
    </main>
  );
}
