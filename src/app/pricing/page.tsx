import type { Metadata } from "next";
import Link from "next/link";
import MarketingPageShell from "@/components/MarketingPageShell";
import PricingTiers from "@/components/PricingTiers";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Free QR checkout with a 2.5% card fee, or Pro to remove it. Same plan for stall and pre-orders.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <MarketingPageShell>
      <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight">
          Pricing
        </h1>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">
          One account for stall checkout and pre-orders. Start free - Cash and
          PayID from day one.
        </p>
        <div className="mt-10">
          <PricingTiers />
        </div>
        <p className="mt-8 text-sm text-[var(--muted)]">
          <Link href="/signup" className="font-medium text-[var(--leaf-dark)] underline">
            Start free
          </Link>{" "}
          ·{" "}
          <Link href="/demo" className="underline">
            Try demo
          </Link>
        </p>
      </main>
    </MarketingPageShell>
  );
}
