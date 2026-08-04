import type { Metadata } from "next";
import LpClosingCta from "@/components/lp/LpClosingCta";
import LpCtaParamScript from "@/components/lp/LpCtaParamScript";
import LpFeatures from "@/components/lp/LpFeatures";
import LpFooter from "@/components/lp/LpFooter";
import LpHero from "@/components/lp/LpHero";
import LpHowItWorks from "@/components/lp/LpHowItWorks";
import LpObjections from "@/components/lp/LpObjections";
import LpPricing from "@/components/lp/LpPricing";
import LpProblem from "@/components/lp/LpProblem";
import LpTestimonial from "@/components/lp/LpTestimonial";
import { APP_NAME } from "@/lib/constants";

/** Fully static HTML — no searchParams (that forces dynamic). CTA params patched client-side. */
export const dynamic = "force-static";
export const revalidate = false;

export const metadata: Metadata = {
  title: `Your stall, minus the missed sales · ${APP_NAME}`,
  description:
    "Give your stall its own QR code so customers can pay by card, PayID or cash. Free to start, no monthly fee.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/lp/missed-sales" },
};

export default function MissedSalesLpPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col bg-[var(--panel)]">
      <LpHero />
      <LpProblem />
      <LpHowItWorks />
      <LpObjections />
      <LpFeatures />
      <LpPricing />
      <LpTestimonial />
      <LpClosingCta />
      <LpFooter />
      <LpCtaParamScript />
    </main>
  );
}
