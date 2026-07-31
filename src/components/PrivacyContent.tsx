import { APP_NAME } from "@/lib/constants";
import {
  LEGAL_ABN,
  LEGAL_ADDRESS_LINE,
  LEGAL_EMAIL,
  LEGAL_ENTITY,
} from "@/lib/legal";

export default function PrivacyContent() {
  return (
    <article className="prose-marketing space-y-8 text-[var(--ink)]">
      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
          Who we are
        </h2>
        <p className="text-[var(--muted)]">
          {APP_NAME} is operated by {LEGAL_ENTITY} (ABN {LEGAL_ABN}),{" "}
          {LEGAL_ADDRESS_LINE}. Contact:{" "}
          <a className="text-[var(--leaf-dark)] underline" href={`mailto:${LEGAL_EMAIL}`}>
            {LEGAL_EMAIL}
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
          What we collect
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-[var(--muted)]">
          <li>Account email and session data for owner sign-in (magic link).</li>
          <li>Business, stand, product, inventory, and order records you enter.</li>
          <li>Payment-related identifiers when you connect Stripe or PayPal (handled by those providers).</li>
          <li>Device and usage data needed to run the service (e.g. push notification tokens on the owner app).</li>
          <li>Messages you send via our contact form (name, email, message).</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
          Why we collect it
        </h2>
        <p className="text-[var(--muted)]">
          We use this information to provide and improve {APP_NAME}, authenticate users, process
          subscriptions and payments, send operational alerts (sales, low stock), respond to
          enquiries, and meet legal obligations under Australian law.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
          Processors and overseas disclosure
        </h2>
        <p className="text-[var(--muted)]">
          We use trusted processors (for example hosting, email delivery, Stripe, and PayPal).
          Some processors store or process data outside Australia. We take reasonable steps to
          ensure appropriate handling consistent with the Australian Privacy Principles where they
          apply.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
          Restock alerts
        </h2>
        <p className="text-[var(--muted)]">
          When you buy from a stand, you may opt in to an email when that stand restocks.
          Collecting opt-ins is available on Starter; sending restock emails is a Pro
          feature. {LEGAL_ENTITY} ({APP_NAME}) is the controller: we store your email and
          consent record solely for that purpose. Stand owners see a subscriber count and can
          ask us to send a restock notice - they never receive or export your address. Emails
          are delivered via Resend (processor). You can unsubscribe any time via the link in
          each email (no login). We retain active subscriptions until you unsubscribe or the
          stand is removed; unsubscribed records may be kept briefly for audit.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
          Cookies and sessions
        </h2>
        <p className="text-[var(--muted)]">
          We use session cookies and similar technologies necessary to keep you signed in and
          operate the service. We do not sell personal information.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
          Advertising measurement
        </h2>
        <p className="text-[var(--muted)]">
          We use Meta, Google Analytics, and Reddit advertising pixels to understand how
          people find {APP_NAME} and to measure campaigns. When you are signed in as an
          owner, we may pass a hashed (SHA-256) copy of your account email and internal
          user id to Reddit for advanced matching. We do not put plaintext emails in page
          source for this purpose. You can limit ad tracking via your browser or platform
          settings where available.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
          Retention and your rights
        </h2>
        <p className="text-[var(--muted)]">
          We retain account and transaction data while your account is active and for a reasonable
          period afterward for billing, disputes, and legal requirements. You can delete your
          account anytime in Settings → Delete account (this cancels any Stallside subscription and
          removes your stands and related data). You may also request access to or correction of
          personal information we hold about you by emailing {LEGAL_EMAIL}.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
          Changes
        </h2>
        <p className="text-[var(--muted)]">
          We may update this policy as {APP_NAME} evolves. Continued use after changes means you
          accept the updated draft unless a successor policy states otherwise.
        </p>
      </section>
    </article>
  );
}
