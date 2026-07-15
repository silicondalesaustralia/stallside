import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import MarketingPageShell from "@/components/MarketingPageShell";
import { APP_NAME, APP_POSITIONING, APP_TAGLINE } from "@/lib/constants";
import {
  LEGAL_ABN,
  LEGAL_ADDRESS_LINE,
  LEGAL_EMAIL,
  LEGAL_ENTITY,
} from "@/lib/legal";
import { marketingPageGraphSchema } from "@/lib/schema";

const title = "About";
const description = `${APP_NAME} is QR self-checkout and inventory for unmanned farm stands. Operated by ${LEGAL_ENTITY}.`;

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
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          About {APP_NAME}
        </h1>
        <p className="mt-4 text-lg text-[var(--muted)]">{APP_POSITIONING}</p>
        <p className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--leaf-dark)]">
          {APP_TAGLINE}
        </p>

        <div className="mt-10 space-y-6 text-[var(--muted)]">
          <p>
            {APP_NAME} is software for unmanned farm stands and honesty stalls. Shoppers scan a
            printed QR code, pick what they&apos;re taking, and pay—while owners track stock,
            sales, and low-stock alerts from a phone or laptop.
          </p>
          <p>
            We built it for operators who can&apos;t (or don&apos;t want to) staff the stall all
            day, but still need a reliable checkout and inventory trail.
          </p>
        </div>

        <section className="mt-12 space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
            Who operates Stallside
          </h2>
          <p className="text-[var(--muted)]">
            {LEGAL_ENTITY}
            <br />
            ABN {LEGAL_ABN}
            <br />
            {LEGAL_ADDRESS_LINE}
            <br />
            <a className="text-[var(--leaf-dark)] underline" href={`mailto:${LEGAL_EMAIL}`}>
              {LEGAL_EMAIL}
            </a>
          </p>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
          >
            Contact us
          </Link>
          <Link
            href="/#pricing"
            className="rounded-[var(--radius-pill)] border border-[var(--line)] px-5 py-3 text-sm font-semibold text-[var(--field)] hover:border-[var(--leaf)]"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="rounded-[var(--radius-pill)] border border-[var(--line)] px-5 py-3 text-sm font-semibold text-[var(--field)] hover:border-[var(--leaf)]"
          >
            Owner login
          </Link>
        </div>
      </main>
    </MarketingPageShell>
  );
}
