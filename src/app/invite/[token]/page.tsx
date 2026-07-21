import Link from "next/link";
import { notFound } from "next/navigation";
import BrandLockup from "@/components/BrandLockup";
import PaymentIconRow from "@/components/PaymentIconRow";
import { APP_NAME } from "@/lib/constants";
import {
  getLifetimeInvite,
  inviteHasSeats,
} from "@/lib/lifetime-invite";
import { requestLifetimeSignup } from "@/app/login/actions";

const FEATURES = [
  "Cash and PayID at the stand",
  "Tap & Go — card, Apple Pay, and Google Pay",
  "PayPal when Connect is live",
  "Stock tracking, QR posters, sale and low-stock alerts",
  "No terminal, no hardware, no percentage of sales",
  "Payouts straight to your Stripe account",
] as const;

export default async function LifetimeInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await getLifetimeInvite(token);
  if (!invite) notFound();

  const open = inviteHasSeats(invite);
  const remaining = Math.max(0, invite.maxUses - invite.useCount);

  if (!open) {
    return (
      <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        <BrandLockup />
        <h1 className="mt-8 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)]">
          Offer fully claimed
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          This Free for Life invite has no seats left. If you still need access,
          ask the person who shared the link for a new one.
        </p>
        <p className="mt-6 text-sm text-[var(--muted)]">
          Already signed up?{" "}
          <Link href="/login" className="font-semibold text-[var(--leaf-dark)] underline">
            Sign in
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <BrandLockup />
      <h1 className="mt-8 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)]">
        Free for Life
      </h1>
      <p className="mt-2 text-[var(--muted)]">
        You&apos;ve been invited to Stallside on the full Card / Tap &amp; Go plan —
        forever, no subscription. Name and email only. We&apos;ll send a 6-digit
        sign-in code.
      </p>
      {invite.maxUses > 1 ? (
        <p className="mt-2 text-sm font-medium text-[var(--leaf-dark)]">
          {remaining} of {invite.maxUses} seats left on this invite
        </p>
      ) : null}

      <div className="mt-6">
        <PaymentIconRow
          brands={["cash", "payid", "card", "apple", "google", "paypal"]}
        />
      </div>

      <ul className="mt-5 flex flex-col gap-2 text-sm text-[var(--ink)]">
        {FEATURES.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <span
              className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--leaf)]"
              aria-hidden
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <form action={requestLifetimeSignup} className="mt-8 flex w-full flex-col gap-4">
        <input type="hidden" name="inviteToken" value={token} />
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
          Claim Free for Life
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
