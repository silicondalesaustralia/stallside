import Link from "next/link";
import BrandLockup from "@/components/BrandLockup";
import CashConfirmMock from "@/components/CashConfirmMock";
import HeroCheckoutDemo from "@/components/HeroCheckoutDemo";
import { APP_NAME, APP_HERO_SUPPORT, APP_POSITIONING, APP_TAGLINE } from "@/lib/constants";

const WORDMARK = APP_NAME.toLowerCase();

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-[var(--field)] text-[var(--ink-on-dark)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 55% at 15% 20%, rgb(46 125 63 / 0.45) 0%, transparent 55%),
            radial-gradient(ellipse 50% 45% at 88% 75%, rgb(46 125 63 / 0.22) 0%, transparent 50%),
            linear-gradient(165deg, #1f4a2a 0%, var(--field) 48%, #0f2416 100%)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Cpath d='M0 0h8v8H0zm28 28h8v8h-8z' fill='%23EAF2E6'/%3E%3C/svg%3E")`,
          backgroundSize: "64px 64px",
        }}
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
        <BrandLockup variant="dark" size="sm" />
        <Link
          href="/login"
          className="rounded-[var(--radius-pill)] border border-[var(--ink-on-dark)]/30 bg-white/5 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition duration-150 hover:bg-white/10"
        >
          Owner login
        </Link>
      </header>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-8 px-5 pb-10 pt-2 sm:px-6 sm:pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-10">
        <div
          aria-hidden
          className="hero-bracket pointer-events-none absolute left-5 top-0 size-12 border-l-[3px] border-t-[3px] border-[var(--ink-on-dark)]/40 sm:left-6 sm:size-16"
          style={{ borderTopLeftRadius: 10 }}
        />

        <div className="relative min-w-0">
          <h1
            className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,11vw,5.25rem)] font-bold leading-[0.9] tracking-[-0.035em] lowercase"
            aria-label={WORDMARK}
          >
            {WORDMARK.split("").map((letter, i) => (
              <span
                key={`${letter}-${i}`}
                className="hero-letter"
                style={{ animationDelay: `${i * 28}ms` }}
              >
                {letter}
              </span>
            ))}
          </h1>
          <p className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--ink-on-dark)] sm:mt-4 sm:text-2xl">
            {APP_TAGLINE}
          </p>
          <p className="mt-3 max-w-xl text-base leading-snug text-[var(--ink-on-dark)]/75">
            {APP_POSITIONING}
          </p>
          <p className="mt-2 max-w-xl text-base leading-snug text-[var(--ink-on-dark)]/75">
            {APP_HERO_SUPPORT}
          </p>
          <p className="mt-2 max-w-xl text-sm leading-snug text-[var(--ink-on-dark)]/60 sm:text-base">
            The honesty stall, upgraded — however your customers want to pay.
          </p>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-2 font-medium text-[var(--ink-on-dark)]">
              <span className="size-2 rounded-full bg-[var(--leaf)]" aria-hidden />
              Cash - live today
            </span>
            <span className="inline-flex items-center gap-2 font-medium text-[var(--ink-on-dark)]/55">
              <span
                className="size-2 rounded-full border border-[var(--ink-on-dark)]/40 bg-transparent"
                aria-hidden
              />
              Tap &amp; Go - coming soon
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex rounded-[var(--radius-pill)] bg-[var(--leaf)] px-6 py-3 text-sm font-semibold text-white transition duration-150 hover:bg-[var(--leaf-dark)]"
            >
              Open your stand
            </Link>
            <Link
              href="#pricing"
              className="inline-flex rounded-[var(--radius-pill)] border border-[var(--ink-on-dark)]/35 px-6 py-3 text-sm font-semibold text-[var(--ink-on-dark)] transition hover:bg-white/5"
            >
              See pricing
            </Link>
          </div>
        </div>

        <div className="hidden min-w-0 lg:block">
          <HeroCheckoutDemo />
        </div>
        <div className="lg:hidden">
          <CashConfirmMock compact />
        </div>
      </div>
    </section>
  );
}
