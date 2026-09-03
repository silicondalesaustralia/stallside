import type { Metadata } from "next";
import Link from "next/link";
import MarketingPageShell from "@/components/MarketingPageShell";
import DemoHubTabs from "@/components/demo/DemoHubTabs";
import WebsiteDemoPanel from "@/components/demo/WebsiteDemoPanel";
import FarmstandCheckoutDemo from "@/components/demo/FarmstandCheckoutDemo";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Demo",
  description: `Try a live ${APP_NAME} website template demo or farmstand checkout — same tools owners use.`,
  alternates: { canonical: "/demo" },
};

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; product?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab === "checkout" ? "checkout" : "website";

  return (
    <MarketingPageShell>
      <main className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
        <p className="text-sm text-[var(--muted)]">
          <Link href="/" className="underline">
            Home
          </Link>
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          Demo
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-snug text-[var(--muted)]">
          Two products, one place: a full Website Studio storefront, or unattended
          farmstand checkout.
        </p>

        <div className="mt-8">
          <DemoHubTabs active={tab}>
            {tab === "website" ? (
              <WebsiteDemoPanel />
            ) : (
              <FarmstandCheckoutDemo productParam={params.product} />
            )}
          </DemoHubTabs>
        </div>
      </main>
    </MarketingPageShell>
  );
}
