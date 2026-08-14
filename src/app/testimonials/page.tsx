import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import MarketingDashboardSection from "@/components/MarketingDashboardSection";
import MarketingPageShell from "@/components/MarketingPageShell";
import { APP_NAME } from "@/lib/constants";
import { marketingPageGraphSchema } from "@/lib/schema";
import { testimonials } from "@/lib/testimonials";

const title = "Testimonials";
const description = `What stand owners say about setting up and selling with ${APP_NAME}.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/testimonials" },
};

export default function TestimonialsPage() {
  return (
    <MarketingPageShell>
      <JsonLd
        data={marketingPageGraphSchema({
          path: "/testimonials",
          name: `${title} · ${APP_NAME}`,
          description,
          type: "WebPage",
        })}
      />
      <main className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          Testimonials
        </h1>
        <p className="mt-3 text-base text-[var(--muted)] sm:text-lg">
          Real notes from people running stalls with {APP_NAME}.
        </p>

        <ul className="mt-12 flex flex-col gap-12">
          {testimonials.map((item) => (
            <li key={item.id}>
              <blockquote className="border-l-4 border-[var(--leaf)] pl-5 sm:pl-6">
                <div className="space-y-4 text-base leading-relaxed text-[var(--ink)] sm:text-lg">
                  {item.quote.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                  ))}
                </div>
                <footer className="mt-5 font-[family-name:var(--font-display)] text-lg font-bold text-[var(--field)]">
                  {item.name}
                  <span className="mt-0.5 block text-sm font-normal text-[var(--muted)]">
                    {item.location}
                  </span>
                </footer>
              </blockquote>
            </li>
          ))}
        </ul>

        <p className="mt-14 text-sm text-[var(--muted)]">
          Running a stand?{" "}
          <Link href="/contact?subject=feedback" className="font-semibold text-[var(--leaf-dark)] underline">
            Share your story
          </Link>{" "}
          or{" "}
          <Link href="/demo" className="font-semibold text-[var(--leaf-dark)] underline">
            try the demo
          </Link>
          .
        </p>
      </main>
      <MarketingDashboardSection />
    </MarketingPageShell>
  );
}
