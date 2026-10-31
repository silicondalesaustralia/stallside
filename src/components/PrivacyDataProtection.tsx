import { LEGAL_EMAIL } from "@/lib/legal";

export default function PrivacyDataProtection() {
  return (
    <section className="space-y-3">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
        How we protect your data
      </h2>
      <p className="text-[var(--muted)]">
        We use technical and organisational safeguards to protect personal and sensitive data,
        including OAuth tokens for connected accounts:
      </p>
      <ul className="list-disc space-y-2 pl-5 text-[var(--muted)]">
        <li>
          <strong>Encryption in transit:</strong> all traffic to and from our app and APIs uses
          HTTPS (TLS). Calls we make to third-party APIs (such as Google) also use TLS.
        </li>
        <li>
          <strong>Encryption at rest:</strong> data is stored in managed databases and storage whose
          disks are encrypted at rest (AES-256).
        </li>
        <li>
          <strong>Server-side token storage:</strong> OAuth access and refresh tokens are stored only
          on our servers. They are never sent to your browser or exposed in page source.
        </li>
        <li>
          <strong>Access control:</strong> databases holding connected-account data deny all public
          and client access. Only our server, using restricted service credentials kept in
          encrypted environment configuration, can read them. Staff access is limited to the minimum
          needed to operate and support the service.
        </li>
        <li>
          <strong>Authentication:</strong> account sign-in uses one-time email codes or links (no
          passwords to steal), and every request is checked against your account and business
          before data is returned.
        </li>
        <li>
          <strong>Payments:</strong> card details are handled directly by Stripe, PayPal, or Square.
          We never receive or store full card numbers.
        </li>
        <li>
          <strong>Minimisation and deletion:</strong> we only request the access a feature needs, and
          delete tokens when you disconnect an account.
        </li>
      </ul>
      <p className="text-[var(--muted)]">
        If a data breach is likely to cause serious harm, we will notify affected users and the
        Office of the Australian Information Commissioner as required by the Notifiable Data
        Breaches scheme. Report security concerns to {LEGAL_EMAIL}.
      </p>
    </section>
  );
}
