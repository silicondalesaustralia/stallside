import Link from "next/link";
import BrandLockup from "@/components/BrandLockup";
import PasteMagicLink from "./PasteMagicLink";

export default function CheckEmailPage() {
  const emailLive = Boolean(process.env.RESEND_API_KEY);

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <BrandLockup />
      <h1 className="mt-8 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)]">
        {emailLive ? "Check your email" : "Check your terminal"}
      </h1>
      {emailLive ? (
        <p className="mt-3 text-[var(--muted)]">
          We sent a one-time sign-in link. Open it on this device — it expires in about an hour and
          only works once.
        </p>
      ) : (
        <p className="mt-3 text-[var(--muted)]">
          Email isn&apos;t configured on this server. Look in the process logs for{" "}
          <strong>[Stallside magic link]</strong>, or set <code className="text-sm">RESEND_API_KEY</code>{" "}
          and <code className="text-sm">EMAIL_FROM</code>.
        </p>
      )}
      {emailLive ? null : <PasteMagicLink />}
      <p className="mt-4 text-sm text-[var(--muted)]">
        Tokens only work once — if it fails, request a new link.
      </p>
      <Link href="/login" className="mt-6 text-sm font-medium text-[var(--leaf-dark)] underline">
        Request a new link
      </Link>
    </main>
  );
}
