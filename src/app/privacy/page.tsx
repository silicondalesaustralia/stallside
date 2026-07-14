import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]">
        Privacy
      </h1>
      <p className="mt-4 text-[var(--muted)]">
        Full privacy policy for {APP_NAME} is being prepared. Contact{" "}
        <a className="underline" href="mailto:hello@stallside.app">
          hello@stallside.app
        </a>{" "}
        with questions.
      </p>
      <Link href="/" className="mt-8 inline-block text-sm text-[var(--leaf-dark)] underline">
        Home
      </Link>
    </main>
  );
}
