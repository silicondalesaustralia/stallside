import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import MarketingPageShell from "@/components/MarketingPageShell";
import PrivacyContent from "@/components/PrivacyContent";
import { APP_NAME } from "@/lib/constants";
import { marketingPageGraphSchema } from "@/lib/schema";

const title = "Privacy";
const description = `Privacy policy for ${APP_NAME}. How we handle account, stand, and payment-related data under Australian privacy principles.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <MarketingPageShell>
      <JsonLd
        data={marketingPageGraphSchema({
          path: "/privacy",
          name: `${title} · ${APP_NAME}`,
          description,
        })}
      />
      <main className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          Privacy
        </h1>
        <div className="mt-8">
          <PrivacyContent />
        </div>
      </main>
    </MarketingPageShell>
  );
}
