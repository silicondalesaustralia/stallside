import { APP_DOMAIN, APP_NAME } from "@/lib/constants";
import {
  LEGAL_ADDRESS_LINE,
  LEGAL_EMAIL,
  LEGAL_ENTITY,
} from "@/lib/legal";

export default function TermsContent() {
  return (
    <article className="prose-marketing space-y-8 text-[var(--ink)]">
      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
          Agreement
        </h2>
        <p className="text-[var(--muted)]">
          These Terms govern use of {APP_NAME} ({APP_DOMAIN}), a software service operated by{" "}
          {LEGAL_ENTITY}, {LEGAL_ADDRESS_LINE}. By creating an account or using the service you
          agree to these Terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
          The service
        </h2>
        <p className="text-[var(--muted)]">
          {APP_NAME} provides QR self-checkout, inventory, and related tools for unmanned farm
          stands and similar stalls. Features, plans, and pricing may change; we will describe
          current plans on the site. Third-party payment processors (e.g. Stripe, PayPal) have
          their own terms; we are not those processors.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
          Subscriptions and fees
        </h2>
        <p className="text-[var(--muted)]">
          Paid plans are billed as described at signup or in your dashboard. Free is
          $0/mo with all features. Vendl Pro removes the Vendl card fee for a
          monthly subscription. You are responsible for applicable taxes.
          Refunds are handled case-by-case unless required by Australian Consumer Law.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
          Card processing fees (Free plan)
        </h2>
        <p className="text-[var(--muted)]">
          On the Free plan, card, Tap &amp; Go (including Apple Pay and Google Pay),
          and pay-later payments carry a Vendl fee of 2.5% on all
          transactions, in addition to the payment processor&apos;s own fees. Cash and
          PayID payments carry no Vendl fee. This fee is removed on the Pro plan
          and for Free for Life accounts, so there is no absorb / pass-on choice when
          no Vendl fee applies.
        </p>
        <p className="text-[var(--muted)]">
          On Free, stall owners may choose in Settings → Card / Tap &amp; Go to pass
          this Vendl fee on to their customers at checkout (shown as a clear card
          fee line), or to absorb it themselves so the customer pays the listed price.
          Owners who choose to pass the fee to customers are solely responsible for
          ensuring that any such surcharge complies with the card-surcharging laws
          applicable in their location. Vendl is not responsible for an owner&apos;s
          compliance with local surcharging regulations.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
          Owner responsibilities
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-[var(--muted)]">
          <li>You set product prices, stock, and stand content accurately.</li>
          <li>
            Cash / honesty-stand sales rely on customer confirmation; {APP_NAME} logs reported
            sales and does not guarantee payment or prevent theft.
          </li>
          <li>You comply with food, trading, and tax laws that apply to your business.</li>
          <li>You keep login access secure and use the service lawfully.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
          Acceptable use
        </h2>
        <p className="text-[var(--muted)]">
          Do not misuse the platform, interfere with other users, attempt unauthorised access,
          or use {APP_NAME} for illegal goods or services. We may suspend or terminate accounts
          that breach these Terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
          Intellectual property
        </h2>
        <p className="text-[var(--muted)]">
          {APP_NAME}, its branding, and software remain ours (or our licensors&apos;). You keep
          ownership of content you upload (product names, images, stand details) and grant us a
          licence to host and display it to operate the service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
          Liability
        </h2>
        <p className="text-[var(--muted)]">
          To the maximum extent permitted by law, {LEGAL_ENTITY} is not liable for lost profits,
          stock loss, unpaid cash sales, or consequential loss arising from use of an unattended
          stand or the service. Nothing in these Terms excludes rights you cannot waive under
          Australian Consumer Law. Our aggregate liability for claims relating to the service is
          limited to fees you paid us in the three months before the claim.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
          Termination
        </h2>
        <p className="text-[var(--muted)]">
          You may stop using {APP_NAME} and cancel your plan as offered in the product. We may
          suspend or end access for non-payment, breach, or if we discontinue the service with
          reasonable notice where practicable.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
          Governing law
        </h2>
        <p className="text-[var(--muted)]">
          These Terms are governed by the laws of South Australia and the Commonwealth of
          Australia. Courts in South Australia have non-exclusive jurisdiction. Questions:{" "}
          <a className="text-[var(--leaf-dark)] underline" href={`mailto:${LEGAL_EMAIL}`}>
            {LEGAL_EMAIL}
          </a>
          .
        </p>
      </section>
    </article>
  );
}
