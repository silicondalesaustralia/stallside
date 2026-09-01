import BrandLockup from "@/components/BrandLockup";
import {
  BUSINESS_MODE_OPTIONS,
  FULFILMENT_INTENTS,
  SELL_CATEGORIES,
  AU_STATES,
  defaultFulfilmentIntents,
  isBusinessMode,
  isOnboardingStep,
  normalizeBusinessMode,
  type OnboardingStep,
} from "@/lib/business-mode";
import { STAND_TIMEZONES, DEFAULT_TIMEZONE } from "@/lib/stand-timezone";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  saveBusinessMode,
  saveBusinessProfile,
  saveSellCategories,
  saveFulfilmentIntents,
  saveThemeDefaults,
  createFirstProduct,
  skipOnboardingStep,
  finishOnboarding,
  completeOnboarding,
} from "./actions";
import OnboardingStepShell from "./OnboardingStepShell";
import OnboardingSkipButton from "./OnboardingSkipButton";

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
          One quick step before guided setup.
        </p>
        <form action={completeOnboarding} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Business / farm name</span>
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
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Phone (optional)</span>
            <input
              name="contactPhone"
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

  if (step === "profile") {
    return (
      <OnboardingStepShell
        step="profile"
        title="Business profile"
        subtitle="Australian defaults — only essentials are required."
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
            <span className="font-medium">Short description (optional)</span>
            <textarea
              name="shortDescription"
              rows={2}
              defaultValue={owner.shortDescription ?? ""}
              className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Contact email</span>
            <input
              name="contactEmail"
              type="email"
              required
              defaultValue={owner.contactEmail}
              className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Phone (optional)</span>
            <input
              name="contactPhone"
              defaultValue={owner.contactPhone ?? ""}
              className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium">Suburb</span>
              <input
                name="suburb"
                defaultValue={owner.suburb ?? ""}
                className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium">Postcode</span>
              <input
                name="postcode"
                defaultValue={owner.postcode ?? ""}
                className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5"
              />
            </label>
          </div>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">State / territory</span>
            <select
              name="stateTerritory"
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
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">ABN (optional)</span>
            <input
              name="abn"
              defaultValue={owner.abn ?? ""}
              className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="gstRegistered"
              defaultChecked={owner.gstRegistered}
              className="size-4"
            />
            GST registered
          </label>
          <button
            type="submit"
            className="mt-2 rounded-[var(--radius-pill)] bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
          >
            Continue
          </button>
        </form>
        <OnboardingSkipButton step="profile" />
      </OnboardingStepShell>
    );
  }

  if (step === "sell") {
    const selected = new Set(owner.sellCategories);
    return (
      <OnboardingStepShell
        step="sell"
        title="What do you sell?"
        subtitle="Helps personalise setup tips — never locks your catalogue."
      >
        <form action={saveSellCategories} className="flex flex-col gap-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {SELL_CATEGORIES.map((c) => (
              <label
                key={c.id}
                className="flex cursor-pointer items-center gap-2 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 text-sm has-[:checked]:border-[var(--leaf)]"
              >
                <input
                  type="checkbox"
                  name="sellCategories"
                  value={c.id}
                  defaultChecked={selected.has(c.id)}
                  className="size-4"
                />
                {c.label}
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="mt-4 rounded-[var(--radius-pill)] bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
          >
            Continue
          </button>
        </form>
        <OnboardingSkipButton step="sell" />
      </OnboardingStepShell>
    );
  }

  if (step === "fulfilment") {
    const mode = normalizeBusinessMode(owner.businessMode);
    const defaults = new Set(
      owner.fulfilmentIntents.length > 0
        ? owner.fulfilmentIntents
        : defaultFulfilmentIntents(mode),
    );
    return (
      <OnboardingStepShell
        step="fulfilment"
        title="How will you fulfil orders?"
        subtitle="Pick what you want to offer. You can change this later."
      >
        <form action={saveFulfilmentIntents} className="flex flex-col gap-3">
          {FULFILMENT_INTENTS.map((f) => (
            <label
              key={f.id}
              className="flex cursor-pointer items-center gap-2 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 text-sm has-[:checked]:border-[var(--leaf)]"
            >
              <input
                type="checkbox"
                name="fulfilmentIntents"
                value={f.id}
                defaultChecked={defaults.has(f.id)}
                className="size-4"
              />
              {f.label}
            </label>
          ))}
          <button
            type="submit"
            className="mt-4 rounded-[var(--radius-pill)] bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
          >
            Continue
          </button>
        </form>
        <OnboardingSkipButton step="fulfilment" />
      </OnboardingStepShell>
    );
  }

  if (step === "payments") {
    return (
      <OnboardingStepShell
        step="payments"
        title="Payments"
        subtitle="Card is optional for now. Cash and PayID can work without Stripe."
      >
        <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--panel)] p-5 text-sm text-[var(--muted)]">
          <p>
            After setup, connect Stripe from Settings → Payments for Tap & Go,
            Apple Pay and Google Pay. Skipping here just adds it to Getting
            Started.
          </p>
        </div>
        <form action={skipOnboardingStep} className="mt-6 flex flex-col gap-3">
          <input type="hidden" name="step" value="payments" />
          <button
            type="submit"
            className="rounded-[var(--radius-pill)] bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
          >
            Continue
          </button>
        </form>
        <OnboardingSkipButton step="payments" />
      </OnboardingStepShell>
    );
  }

  if (step === "product") {
    return (
      <OnboardingStepShell
        step="product"
        title="Add your first product"
        subtitle="Optional — you can add products from the dashboard later."
      >
        <form action={createFirstProduct} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Name</span>
            <input
              name="name"
              required
              placeholder="Dozen eggs"
              className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Price (AUD)</span>
            <input
              name="price"
              required
              inputMode="decimal"
              placeholder="8.00"
              className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Stock</span>
            <input
              name="stock"
              defaultValue="12"
              className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Short description (optional)</span>
            <input
              name="description"
              className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-[var(--radius-pill)] bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
          >
            Save product
          </button>
        </form>
        <OnboardingSkipButton step="product" />
      </OnboardingStepShell>
    );
  }

  if (step === "theme") {
    return (
      <OnboardingStepShell
        step="theme"
        title="Brand colours"
        subtitle="Applied to your stand / shop. You can refine later."
      >
        <form action={saveThemeDefaults} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Primary colour</span>
            <input
              type="color"
              name="brandAccentColor"
              defaultValue={owner.brandAccentColor ?? "#2e7d3f"}
              className="h-12 w-full cursor-pointer rounded-[var(--radius)] border border-[var(--line)] bg-white"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Accent colour</span>
            <input
              type="color"
              name="brandSecondaryColor"
              defaultValue={owner.brandSecondaryColor ?? "#f5a623"}
              className="h-12 w-full cursor-pointer rounded-[var(--radius)] border border-[var(--line)] bg-white"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-[var(--radius-pill)] bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
          >
            Continue
          </button>
        </form>
        <OnboardingSkipButton step="theme" />
      </OnboardingStepShell>
    );
  }

  // finish
  const modeLabel = isBusinessMode(owner.businessMode)
    ? BUSINESS_MODE_OPTIONS.find((o) => o.id === owner.businessMode)?.title
    : "Vendl";

  return (
    <OnboardingStepShell
      step="finish"
      title="You are ready"
      subtitle={`${modeLabel ?? "Your"} setup is saved. Open the dashboard to keep going.`}
    >
      <form action={finishOnboarding}>
        <button
          type="submit"
          className="rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
        >
          Go to dashboard
        </button>
      </form>
      <p className="mt-4 text-sm text-[var(--muted)]">
        Getting Started will guide stand, products, QR and payments from real
        account data.
      </p>
    </OnboardingStepShell>
  );
}
