import Link from "next/link";
import SetupChecklist from "@/components/SetupChecklist";
import { requireOwner } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { loadSetupProgress } from "@/lib/load-setup-progress";

export default async function GettingStartedPage() {
  const { owner } = await requireOwner();
  const { businesses, selected } = await resolveSelectedBusiness(owner.id);
  const progress = await loadSetupProgress({
    ownerId: owner.id,
    selectedStandId: selected?.id ?? null,
    standSlug: selected?.slug ?? null,
    standCount: businesses.length,
    stripeChargesEnabled: owner.stripeChargesEnabled,
    emailAlertsEnabled: owner.emailAlertsEnabled,
    pushAlertsEnabled: owner.pushAlertsEnabled,
    businessMode: owner.businessMode,
  });

  return (
    <main className="flex max-w-2xl flex-col gap-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
          Setup
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]">
          Getting Started
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Progress is based on your account — not checkboxes you tick. Skip
          optional steps and come back anytime.
        </p>
      </div>

      <div className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[var(--dash-shadow)] md:p-6">
        <SetupChecklist tasks={progress.tasks} summary={progress.summary} />
      </div>

      {progress.summary.next ? (
        <Link
          href={progress.summary.next.href}
          className="inline-flex w-fit rounded-full bg-[var(--leaf)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--leaf-dark)]"
        >
          Continue: {progress.summary.next.title}
        </Link>
      ) : (
        <Link
          href="/dashboard"
          className="inline-flex w-fit rounded-full bg-[var(--leaf)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--leaf-dark)]"
        >
          Back to dashboard
        </Link>
      )}
    </main>
  );
}
