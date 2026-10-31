import { APP_NAME } from "@/lib/constants";
import { LEGAL_EMAIL } from "@/lib/legal";

const linkClass = "text-[var(--leaf-dark)] underline";

export default function PrivacyGoogleUserData() {
  return (
    <section className="space-y-3">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
        Google user data (YouTube)
      </h2>
      <p className="text-[var(--muted)]">
        If you choose to connect a YouTube channel, {APP_NAME} requests access through Google OAuth
        with these scopes only:
      </p>
      <ul className="list-disc space-y-2 pl-5 text-[var(--muted)]">
        <li>
          <strong>youtube.readonly</strong> - to read your channel ID, name, and thumbnail so we can
          show which channel is connected.
        </li>
        <li>
          <strong>youtube.upload</strong> - to upload videos to your channel, with the title,
          description, tags, and privacy setting you choose, only when you publish or schedule a
          post.
        </li>
      </ul>
      <p className="text-[var(--muted)]">
        <strong>How we use it:</strong> only to show your connected channel and publish the videos
        you ask us to. We do not use Google user data for advertising, do not sell it, and do not
        use it to train AI or machine-learning models. Our staff do not read it unless you ask us to for support, or it is needed for security or legal reasons.
      </p>
      <p className="text-[var(--muted)]">
        <strong>Sharing:</strong> we do not share Google user data with third parties, except the
        hosting and database providers that run {APP_NAME} on our behalf, or where required by law.
      </p>
      <p className="text-[var(--muted)]">
        <strong>Storage and protection:</strong> access and refresh tokens and channel details are
        stored server-side only, protected as described in &quot;How we protect your data&quot;
        (TLS in transit, encryption at rest, no browser or public access).
      </p>
      <p className="text-[var(--muted)]">
        <strong>Retention and deletion:</strong> we keep this data only while YouTube is connected.
        When you disconnect, we revoke the token with Google and delete the tokens and channel
        details from our systems. You can also remove access at any time in your{" "}
        <a className={linkClass} href="https://myaccount.google.com/permissions">
          Google Account permissions
        </a>
        , or email {LEGAL_EMAIL} to ask us to delete it.
      </p>
      <p className="text-[var(--muted)]">
        {APP_NAME}&apos;s use and transfer of information received from Google APIs will adhere to
        the{" "}
        <a
          className={linkClass}
          href="https://developers.google.com/terms/api-services-user-data-policy"
        >
          Google API Services User Data Policy
        </a>
        , including the Limited Use requirements.
      </p>
    </section>
  );
}
