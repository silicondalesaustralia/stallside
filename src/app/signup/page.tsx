import Link from "next/link";
import AdAttributionFields from "@/components/AdAttributionFields";
import BrandLockup from "@/components/BrandLockup";
import { HOME_BUTTON, HOME_EYEBROW, HOME_HEADING_FONT } from "@/components/home/home-styles";
import { APP_NAME } from "@/lib/constants";
import { isBillingCurrency } from "@/lib/saas-pricing";
import { requestSignup } from "@/app/login/actions";

const INPUT_CLASS =
  "rounded-md border border-[var(--line)] bg-white px-3.5 py-3 text-base text-[var(--field)] outline-none ring-[var(--leaf)] focus:ring-2";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; currency?: string; interval?: string }>;
}) {
  const params = await searchParams;
  const wantsPro = params.plan === "pro";
  const currency = params.currency && isBillingCurrency(params.currency) ? params.currency : null;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#faf9f5] text-[var(--field)]">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-[22px] py-16">
        <BrandLockup size="md" />
        <p className={`${HOME_EYEBROW} mb-3 mt-10`}>{wantsPro ? "VENDL PRO" : "START FREE"}</p>
        <h1 className={`${HOME_HEADING_FONT} text-[40px] leading-[1.05] text-[var(--field)] sm:text-[48px]`}>
          {wantsPro ? "Pro" : "Free"}
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-[var(--muted)]">
          {wantsPro
            ? "Create your account with your name and email, then continue to Pro checkout."
            : "Everything you need to start selling. Name and email only - no card required."}{" "}
          We&apos;ll send a 6-digit sign-in code.
        </p>
        <form action={requestSignup} className="mt-8 flex w-full flex-col gap-4">
          <AdAttributionFields />
          {wantsPro ? <input type="hidden" name="plan" value="pro" /> : null}
          {wantsPro && currency ? <input type="hidden" name="currency" value={currency} /> : null}
          {wantsPro && params.interval === "year" ? <input type="hidden" name="interval" value="year" /> : null}
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-[var(--field)]">Name</span>
            <input
              type="text"
              name="name"
              required
              autoComplete="name"
              minLength={2}
              placeholder="Sam Farmer"
              className={INPUT_CLASS}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-[var(--field)]">Email</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@farm.com"
              className={INPUT_CLASS}
            />
          </label>
          <button type="submit" className={`${HOME_BUTTON} mt-2 w-full`}>
            {wantsPro ? "Create account" : "Get Free Account"} <span aria-hidden>↗</span>
          </button>
        </form>
        <p className="mt-6 text-sm text-[var(--muted)]">
          Already have an account?{" "}
          <Link href="/login" className="border-b border-current pb-0.5 font-semibold text-[var(--field)] hover:text-[var(--leaf)]">
            Sign in
          </Link>
        </p>
        <p className="mt-4 text-xs text-[var(--muted)]">{APP_NAME.toLowerCase()}.app</p>
      </main>
    </div>
  );
}
