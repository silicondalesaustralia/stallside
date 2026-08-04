import type { Metadata } from "next";
import LpClosingCta from "@/components/lp/LpClosingCta";
import LpFeatures from "@/components/lp/LpFeatures";
import LpFooter from "@/components/lp/LpFooter";
import LpHero from "@/components/lp/LpHero";
import LpHowItWorks from "@/components/lp/LpHowItWorks";
import LpObjections from "@/components/lp/LpObjections";
import LpPricing from "@/components/lp/LpPricing";
import LpProblem from "@/components/lp/LpProblem";
import LpTestimonial from "@/components/lp/LpTestimonial";
import { APP_NAME } from "@/lib/constants";
import { lpSignupHref } from "@/lib/lp-signup-href";

export const metadata: Metadata = {
  title: `Your stall, minus the missed sales · ${APP_NAME}`,
  description:
    "Give your stall its own QR code so customers can pay by card, PayID or cash. Free to start, no monthly fee.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/lp/missed-sales" },
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function MissedSalesLpPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const signupHref = lpSignupHref(params);

  return (
    <main className="flex min-h-full flex-1 flex-col bg-[var(--panel)]">
      <LpHero signupHref={signupHref} />
      <LpProblem />
      <LpHowItWorks />
      <LpObjections />
      <LpFeatures />
      <LpPricing />
      <LpTestimonial />
      <LpClosingCta signupHref={signupHref} />
      <LpFooter />
    </main>
  );
}
