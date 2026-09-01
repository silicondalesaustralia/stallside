import BrandLockup from "@/components/BrandLockup";
import {
  BUSINESS_MODE_OPTIONS,
  AU_STATES,
  isOnboardingStep,
  type OnboardingStep,
} from "@/lib/business-mode";
import { STAND_TIMEZONES, DEFAULT_TIMEZONE } from "@/lib/stand-timezone";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  saveBusinessMode,
  saveBusinessProfile,
  completeOnboarding,
} from "./actions";
import OnboardingStepShell from "./OnboardingStepShell";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const user = await requireUser();
  const owner = await prisma.owner.findUnique({ where: { userId: user.id } });
  const params = await searchParams;

  if (!owner) {
    return (
      <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        <BrandLockup />
        <h1 className="mt-8 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]">
          Set up your business
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Name and email, then choose how you sell.
        </p>
        <form action={completeOnboarding} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Business name</span>
            <input
              name="businessName"
              required
              defaultValue={user.name ?? ""}
              className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Contact email</span>
            <input
              name="contactEmail"
              type="email"
              required
              defaultValue={user.email ?? ""}
              className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5"
            />
          </label>
          <button
            type="submit"
            className="rounded-[var(--radius-pill)] bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
          >
            Continue
          </button>
        </form>
      </main>
    );
  }

  if (owner.onboardingCompletedAt) {
    redirect("/dashboard");
  }

  const step: OnboardingStep = isOnboardingStep(params.step)
    ? params.step
    : owner.businessMode
      ? "profile"
      : "mode";

  if (step === "mode") {
    return (
      <OnboardingStepShell
        step="mode"
        title="What type of business do you want to run with Vendl?"
        subtitle="This only sets your starting checklist — you can enable any feature later."
      >
        <form action={saveBusinessMode} className="flex flex-col gap-3">
          {BUSINESS_MODE_OPTIONS.map((opt) => (
            <label
              key={opt.id}
              className="cursor-pointer rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--panel)] p-4 shadow-[var(--dash-shadow)] has-[:checked]:border-[var(--leaf)]"
            >
              <input
                type="radio"
                name="businessMode"
                value={opt.id}
                required
                defaultChecked={owner.businessMode === opt.id}
                className="sr-only"
              />
              <span className="block font-semibold text-[var(--field)]">
                {opt.title}
              </span>
              <span className="mt-1 block text-sm text-[var(--muted)]">
                {opt.description}
              </span>
              <span className="mt-2 block text-xs text-[var(--muted)]">
                {opt.examples}
              </span>
            </label>
          ))}
          <button
            type="submit"
            className="mt-4 rounded-[var(--radius-pill)] bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
          >
            Continue
          </button>
        </form>
      </OnboardingStepShell>
    );
  }

  return (
    <OnboardingStepShell
      step="profile"
      title="Your business"
      subtitle="Name and location — then we open your dashboard. You can finish the rest there."
    >
      <form action={saveBusinessProfile} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Business name</span>
          <input
            name="businessName"
            required
            defaultValue={owner.businessName}
            className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Suburb / locality</span>
          <input
            name="suburb"
            defaultValue={owner.suburb ?? ""}
            placeholder="Woodend"
            className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">State / territory</span>
          <select
            name="stateTerritory"
            required
            defaultValue={owner.stateTerritory ?? ""}
            className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5"
          >
            <option value="">Select…</option>
            {AU_STATES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Postcode (optional)</span>
          <input
            name="postcode"
            defaultValue={owner.postcode ?? ""}
            className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Timezone</span>
          <select
            name="timezone"
            defaultValue={owner.defaultTimezone || DEFAULT_TIMEZONE}
            className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5"
          >
            {STAND_TIMEZONES.map((z) => (
              <option key={z.value} value={z.value}>
                {z.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="mt-2 rounded-[var(--radius-pill)] bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
        >
          Open dashboard
        </button>
      </form>
      <p className="mt-4 text-sm text-[var(--muted)]">
        Next: add a product from Getting Started. Payments and branding can wait.
      </p>
    </OnboardingStepShell>
  );
}
