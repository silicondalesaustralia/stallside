import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import BrandLockup from "@/components/BrandLockup";
import { APP_NAME, APP_POSITIONING, APP_TAGLINE } from "@/lib/constants";

const WORDMARK = APP_NAME.toLowerCase();

export default function LandingHero() {
  return (
    <section className="relative min-h-[min(92vh,900px)] overflow-hidden bg-[var(--field)] text-[var(--ink-on-dark)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 55% at 15% 20%, rgb(46 125 63 / 0.45) 0%, transparent 55%),
            radial-gradient(ellipse 50% 45% at 88% 75%, rgb(245 166 35 / 0.18) 0%, transparent 50%),
            radial-gradient(ellipse 90% 60% at 50% 110%, rgb(0 0 0 / 0.35) 0%, transparent 55%),
            linear-gradient(165deg, #1f4a2a 0%, var(--field) 42%, #0f2416 100%)
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

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <BrandLockup variant="dark" />
        <Link
          href="/login"
          className="rounded-[var(--radius-pill)] border border-[var(--ink-on-dark)]/30 bg-white/5 px-5 py-2.5 text-sm font-semibold backdrop-blur-sm transition duration-150 hover:bg-white/10"
        >
          Owner login
        </Link>
      </header>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-14 px-6 pb-16 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pb-24 lg:pt-6">
        <div
          aria-hidden
          className="hero-bracket absolute left-5 top-0 size-16 border-l-[4px] border-t-[4px] border-[var(--ink-on-dark)]/40 sm:size-24"
          style={{ borderTopLeftRadius: 12 }}
        />

        <div className="relative max-w-xl pt-6">
          <h1
            className="font-[family-name:var(--font-display)] text-[clamp(3.5rem,14vw,7rem)] font-bold leading-[0.88] tracking-[-0.035em] lowercase"
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
          <p className="mt-7 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--marigold)] sm:text-3xl">
            {APP_TAGLINE}
          </p>
          <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--ink-on-dark)]/75 sm:text-lg">
            {APP_POSITIONING}. Print a QR, take payment, watch stock from anywhere.
          </p>
          <p className="mt-5 text-sm font-semibold text-[var(--ink-on-dark)]">
            Take cash today ·{" "}
            <span className="text-[var(--marigold)]">Tap &amp; Go coming soon</span>
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex rounded-[var(--radius-pill)] bg-[var(--leaf)] px-7 py-3.5 text-sm font-semibold text-white shadow-[inset_0_0_0_2px_var(--marigold),0_12px_40px_rgb(0_0_0/0.25)] transition duration-150 hover:bg-[var(--leaf-dark)]"
            >
              Open your stand
            </Link>
            <Link
              href="#pricing"
              className="inline-flex rounded-[var(--radius-pill)] border border-[var(--ink-on-dark)]/35 px-7 py-3.5 text-sm font-semibold text-[var(--ink-on-dark)] transition hover:bg-white/5"
            >
              See pricing
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[280px] lg:mx-0 lg:ml-auto lg:max-w-[300px]">
          <div
            aria-hidden
            className="hero-bracket absolute -bottom-3 -right-3 size-16 border-b-[4px] border-r-[4px] border-[var(--marigold)] sm:size-20"
            style={{ borderBottomRightRadius: 12 }}
          />
          <div className="hero-phone relative rounded-[32px] border-[5px] border-[var(--ink-on-dark)]/90 bg-[var(--panel)] p-3 shadow-[0_30px_80px_rgb(0_0_0/0.45)]">
            <div className="rounded-[22px] bg-[var(--wash)] px-4 py-5 text-[var(--ink)]">
              <div className="flex items-center gap-2">
                <BrandMark className="size-7" />
                <p className="font-[family-name:var(--font-display)] text-base font-semibold tracking-tight">
                  Valley Eggs
                </p>
              </div>
              <p className="mt-5 text-center text-xs text-[var(--muted)]">Place this in the cash slot</p>
              <p className="mt-2 text-center font-receipt text-4xl font-semibold text-[var(--field)]">
                $6.00
              </p>
              <p className="mt-6 rounded-[var(--radius-pill)] bg-[var(--leaf)] py-3 text-center text-xs font-semibold text-white">
                I have paid cash
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
