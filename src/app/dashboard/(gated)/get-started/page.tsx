import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { loadSetupProgress } from "@/lib/onboarding/setup-progress";
import { onboardingPending } from "@/lib/onboarding/onboarding-gate";
import { assistantEnabledFor } from "@/lib/website-ai/assistant/access";
import { ASSISTANT_PATH } from "@/lib/website/readiness";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import GetStartedCard from "./GetStartedCard";
import { finishOnboarding } from "./actions";

export default async function GetStartedPage() {
  const { owner, user } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  if (!selected) redirect("/dashboard/businesses/new");

  const gate = await onboardingPending(owner, user.email);
  const progress = gate.progress ?? (await loadSetupProgress(owner));
  const websiteHref = assistantEnabledFor(owner.id) ? ASSISTANT_PATH : "/dashboard/website/web-studio";

  return (
    <main className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--leaf-dark)]">
          {selected.name}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">What would you like to do next?</h1>
        <p className="mt-2 text-[var(--muted)]">
          Do these in any order. Each one is ticked off as you finish it.
        </p>
      </div>
      <OnboardingFlow activeStep={2} />
      <ol className="grid gap-4 md:grid-cols-3">
        <GetStartedCard
          number={1}
          icon="products"
          title="Add products"
          body="Eggs, produce, baked goods — plus subscriptions and pre-orders, however you sell."
          href={`/dashboard/products/new?standId=${selected.id}`}
          cta="Add a product"
          done={progress.products}
          extraLinks={[
            { href: "/dashboard/subscriptions/new", label: "Subscription" },
            { href: "/dashboard/pre-order-pages/new", label: "Pre-order page" },
          ]}
        />
        <GetStartedCard
          number={2}
          icon="website"
          title="Build your website"
          body="Your online store, ready to share. Your farm stand QR code works alongside it."
          href={websiteHref}
          cta="Build my website"
          done={progress.website}
        />
        <GetStartedCard
          number={3}
          icon="sell"
          title="Set up checkout & payments"
          body="Connect Stripe, Square or PayPal for card payments, and choose what customers can pay with."
          href={`/dashboard/businesses/${selected.id}?tab=payments`}
          cta="Set up payments"
          done={progress.payments}
        />
      </ol>
      {gate.pending ? (
        <form action={finishOnboarding} className="flex flex-wrap items-center gap-3 text-sm">
          <button
            type="submit"
            disabled={!progress.products}
            className="rounded-full border border-[var(--line)] bg-white px-5 py-2.5 font-semibold text-[var(--ink)] hover:bg-[var(--wash)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Finish setup
          </button>
          <span className="text-[var(--muted)]">
            {progress.products
              ? "You can come back to the rest anytime."
              : "Add your first product to finish setup."}
          </span>
        </form>
      ) : (
        <Link href="/dashboard" className="text-sm font-semibold text-[var(--leaf-dark)] underline">
          Go to your dashboard
        </Link>
      )}
    </main>
  );
}
