import Link from "next/link";
import BrandLockup from "@/components/BrandLockup";
import { APP_NAME, TRIAL_DAYS } from "@/lib/constants";
import { requestSignup } from "@/app/login/actions";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <BrandLockup />
      <h1 className="mt-8 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)]">
        Start free for {TRIAL_DAYS} days
      </h1>
      <p className="mt-2 text-[var(--muted)]">
        Name and email only. No card required. We&apos;ll send a 6-digit sign-in
        code.
      </p>
      <form action={requestSignup} className="mt-8 flex w-full flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-[var(--ink)]">Name</span>
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            minLength={2}
            placeholder="Sam Farmer"
            className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5 text-base outline-none ring-[var(--leaf)] focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-[var(--ink)]">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@farm.com"
            className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5 text-base outline-none ring-[var(--leaf)] focus:ring-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-[var(--radius-pill)] bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--leaf-dark)]"
        >
          Start my {TRIAL_DAYS}-day free trial
        </button>
      </form>
      <p className="mt-6 text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[var(--leaf-dark)] underline">
          Sign in
        </Link>
      </p>
      <p className="mt-4 text-xs text-[var(--muted)]">{APP_NAME.toLowerCase()}.app</p>
    </main>
  );
}
