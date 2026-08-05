import type { Metadata } from "next";
import Link from "next/link";
import BrandLockup from "@/components/BrandLockup";
import SignupCompleteConversion from "@/components/SignupCompleteConversion";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";
import { normalizeAttribution } from "@/lib/ad-attribution";

export const metadata: Metadata = {
  title: `Welcome · ${APP_NAME}`,
  robots: { index: false, follow: false },
};

export default async function SignupCompletePage() {
  const user = await requireUser();
  let email = (user.email ?? "").trim().toLowerCase();
  let adAttribution = null as ReturnType<typeof normalizeAttribution>;
  try {
    const account = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        email: true,
        owner: { select: { adAttribution: true } },
      },
    });
    email = (email || account?.email || "").trim().toLowerCase();
    adAttribution = normalizeAttribution(account?.owner?.adAttribution);
  } catch (error) {
    console.error("signup-complete: attribution lookup failed", error);
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <SignupCompleteConversion
        userId={user.id}
        email={email || null}
        adAttribution={adAttribution}
      />
      <BrandLockup />
      <h1 className="mt-8 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)]">
        You&apos;re in
      </h1>
      <p className="mt-2 text-[var(--muted)]">
        Your account is ready. Set up your stand, print a QR, and start taking
        payments from your phone.
      </p>
      <Link
        href="/dashboard"
        className="mt-8 inline-flex items-center justify-center rounded-[var(--radius-pill)] bg-[var(--leaf)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--leaf-dark)]"
      >
        Go to dashboard
      </Link>
      <p className="mt-6 text-xs text-[var(--muted)]">{APP_NAME.toLowerCase()}.app</p>
    </main>
  );
}
