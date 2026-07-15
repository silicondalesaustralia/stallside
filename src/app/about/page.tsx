import type { Metadata } from "next";
import AboutStory from "@/components/AboutStory";
import JsonLd from "@/components/JsonLd";
import MarketingPageShell from "@/components/MarketingPageShell";
import { APP_NAME } from "@/lib/constants";
import { marketingPageGraphSchema } from "@/lib/schema";

const title = "About";
const description =
  "It started with a kid, some hens, and a roadside table. Stallside began about 500 metres from our front door.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <MarketingPageShell>
      <JsonLd
        data={marketingPageGraphSchema({
          path: "/about",
          name: `${title} · ${APP_NAME}`,
          description,
          type: "AboutPage",
        })}
      />
      <main className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl sm:leading-tight">
          It started with a kid, some hens, and a roadside table
        </h1>
        <div className="mt-10">
          <AboutStory />
        </div>
      </main>
    </MarketingPageShell>
  );
}
