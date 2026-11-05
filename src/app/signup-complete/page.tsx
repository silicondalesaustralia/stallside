import type { Metadata } from "next";
import Link from "next/link";
import BrandLockup from "@/components/BrandLockup";
import SignupCompleteConversion from "@/components/SignupCompleteConversion";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";
import { normalizeAttribution } from "@/lib/ad-attribution";
import { isBillingCurrency } from "@/lib/saas-pricing";
import { ownerIdHasProAccess } from "@/lib/owner-pro-access";
import { redirect } from "next/navigation";
import WelcomeChoiceCards from "./WelcomeChoiceCards";

export const metadata: Metadata = {
  title: "Welcome",
  robots: { index: false, follow: false },
};

const BUTTON_CLASS =
  "mt-6 inline-flex items-center justify-center rounded-[var(--radius-pill)] bg-[var(--leaf)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--leaf-dark)]";

export default async function SignupCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; currency?: string; interval?: string }>;
}) {
  const params = await searchParams;
  const wantsPro = params.plan === "pro";
  const user = await requireUser();
  let email = (user.email ?? "").trim().toLowerCase();
  let adAttribution = null as ReturnType<typeof normalizeAttribution>;
  let ownerId: string | null = null;
  let alreadyChose = false;
  try {
    const account = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        email: true,
        owner: { select: { id: true, adAttribution: true, welcomeChoiceAt: true } },
      },
    });
    email = (email || account?.email || "").trim().toLowerCase();
    adAttribution = normalizeAttribution(account?.owner?.adAttribution);
    ownerId = account?.owner?.id ?? null;
    alreadyChose = Boolean(account?.owner?.welcomeChoiceAt);
  } catch (error) {
    console.error("signup-complete: account lookup failed", error);
  }

  // Returning users, owners who already chose, and Pro subscribers skip the one-time welcome.
  if (alreadyChose || (ownerId && (await ownerIdHasProAccess(ownerId)))) redirect("/dashboard");
  const currency = params.currency && isBillingCurrency(params.currency) ? params.currency : null;

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <SignupCompleteConversion
        userId={user.id}
        email={email || null}
        adAttribution={adAttribution}
      />
      <div className="self-center">
        <BrandLockup />
      </div>
      <h1 className="mt-8 text-center font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)]">
        You&apos;re in! Let&apos;s get Vendl set up.
      </h1>
      {ownerId ? (
        <>
          <p className="mb-6 mt-2 text-center text-[var(--muted)]">
            Your Free account is ready. You can start with Free or unlock more tools with Pro.
          </p>
          <WelcomeChoiceCards
            proFirst={wantsPro}
            currency={currency}
            interval={params.interval === "year" ? "year" : null}
          />
          <p className="mt-4 text-center text-sm text-[var(--muted)]">You can upgrade later from your dashboard.</p>
        </>
      ) : (
        <Link href="/dashboard" className={`${BUTTON_CLASS} self-center`}>
          Go to dashboard
        </Link>
      )}
      <p className="mt-6 text-center text-xs text-[var(--muted)]">{APP_NAME.toLowerCase()}.app</p>
    </main>
  );
}
