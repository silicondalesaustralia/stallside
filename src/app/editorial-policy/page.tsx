import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import MarketingPageShell from "@/components/MarketingPageShell";
import EditorialPolicyContent from "@/components/blog/EditorialPolicyContent";
import { APP_NAME } from "@/lib/constants";
import { editorialPolicyPath } from "@/lib/blog/paths";
import { marketingPageGraphSchema } from "@/lib/schema";

const title = "Editorial policy";
const description =
  "How Vendl chooses, researches, fact-checks, reviews and updates its guides and news for home producers and small sellers.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: editorialPolicyPath() },
};

export default function EditorialPolicyPage() {
  return (
    <MarketingPageShell>
      <JsonLd
        data={marketingPageGraphSchema({
          path: editorialPolicyPath(),
          name: `${title} · ${APP_NAME}`,
          description,
        })}
      />
      <main className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          Editorial policy
        </h1>
        <div className="mt-8">
          <EditorialPolicyContent />
        </div>
      </main>
    </MarketingPageShell>
  );
}
