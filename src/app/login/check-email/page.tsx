import Link from "next/link";
import BrandLockup from "@/components/BrandLockup";
import PasteMagicLink from "./PasteMagicLink";

export default function CheckEmailPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <BrandLockup />
      <h1 className="mt-8 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)]">
        Check your terminal
      </h1>
      <p className="mt-3 text-[var(--muted)]">
        Locally we don&apos;t send real email yet. On your Mac, look in the terminal running{" "}
        <code className="rounded bg-black/5 px-1 py-0.5 text-sm">npm run dev</code> for{" "}
        <strong>[Stallside magic link]</strong>.
      </p>
      <PasteMagicLink />
      <p className="mt-4 text-sm text-[var(--muted)]">
        Tokens only work once — if it fails, request a new link.
      </p>
      <Link href="/login" className="mt-6 text-sm font-medium text-[var(--leaf-dark)] underline">
        Request a new link
      </Link>
    </main>
  );
}
