import type { Metadata } from "next";
import ContactForm from "@/app/contact/ContactForm";
import JsonLd from "@/components/JsonLd";
import MarketingPageShell from "@/components/MarketingPageShell";
import { APP_NAME } from "@/lib/constants";
import {
  LEGAL_ABN,
  LEGAL_ADDRESS_LINE,
  LEGAL_EMAIL,
  LEGAL_ENTITY,
} from "@/lib/legal";
import { marketingPageGraphSchema } from "@/lib/schema";

const title = "Contact";
const description = `Contact ${APP_NAME} — questions about QR checkout for farm stands, pricing, or your account.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <MarketingPageShell>
      <JsonLd
        data={marketingPageGraphSchema({
          path: "/contact",
          name: `${title} · ${APP_NAME}`,
          description,
          type: "ContactPage",
        })}
      />
      <main className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          Contact us
        </h1>
        <p className="mt-4 text-[var(--muted)]">
          Send a message and we&apos;ll reply by email. For account or billing issues, include
          the email you use to sign in.
        </p>

        <div className="mt-10">
          <ContactForm />
        </div>

        <aside className="mt-12 space-y-2 border-t border-[var(--line)] pt-8 text-sm text-[var(--muted)]">
          <p className="font-medium text-[var(--ink)]">{LEGAL_ENTITY}</p>
          <p>ABN {LEGAL_ABN}</p>
          <p>{LEGAL_ADDRESS_LINE}</p>
          <p>
            <a className="text-[var(--leaf-dark)] underline" href={`mailto:${LEGAL_EMAIL}`}>
              {LEGAL_EMAIL}
            </a>
          </p>
        </aside>
      </main>
    </MarketingPageShell>
  );
}
