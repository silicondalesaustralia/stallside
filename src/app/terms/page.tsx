import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import MarketingPageShell from "@/components/MarketingPageShell";
import TermsContent from "@/components/TermsContent";
import { APP_NAME } from "@/lib/constants";
import { marketingPageGraphSchema } from "@/lib/schema";

const title = "Terms";
const description = `Terms of use for ${APP_NAME} — SaaS agreement for stall owners, governed by South Australian and Australian law.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <MarketingPageShell>
      <JsonLd
        data={marketingPageGraphSchema({
          path: "/terms",
          name: `${title} · ${APP_NAME}`,
          description,
        })}
      />
      <main className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          Terms
        </h1>
        <div className="mt-8">
          <TermsContent />
        </div>
      </main>
    </MarketingPageShell>
  );
}
