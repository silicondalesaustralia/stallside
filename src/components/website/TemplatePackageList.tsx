import WebsiteFormError from "@/components/website/WebsiteFormError";
import type { TemplatePackage } from "@/lib/website/templates/package-schema";
import type { TemplateRestorePoint } from "@/lib/website/templates/restore-point";
import {
  applyTemplatePackage,
  undoTemplatePackage,
} from "@/app/dashboard/(gated)/website/studio/templates/actions";

export default function TemplatePackageList({
  packages,
  restorePoint,
  applied,
  undone,
  error,
}: {
  packages: TemplatePackage[];
  restorePoint: TemplateRestorePoint | null;
  applied?: string;
  undone?: boolean;
  error?: string;
}) {
  const appliedName = packages.find((p) => p.id === applied)?.name;
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          Starting layouts
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
          Replaces your homepage and shop page layout in your draft. Your other pages, colours, logo and
          products stay as they are. Nothing goes live until you publish, and you can undo.
        </p>
      </div>
      <WebsiteFormError error={error} fallback="Couldn't apply that layout. Please try again." />
      {appliedName ? (
        <p role="status" className="text-sm font-medium text-[var(--leaf-dark)]">
          {appliedName} applied to your draft.
        </p>
      ) : null}
      {undone ? (
        <p role="status" className="text-sm font-medium text-[var(--leaf-dark)]">
          Your previous layout is back in your draft.
        </p>
      ) : null}
      {restorePoint ? (
        <form action={undoTemplatePackage}>
          <button
            type="submit"
            className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--field)]"
          >
            Undo last layout change
          </button>
        </form>
      ) : null}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <li key={pkg.id} className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-[var(--field)]">{pkg.name}</h3>
            <p className="text-sm text-[var(--muted)]">{pkg.summary}</p>
            <p className="text-xs text-[var(--muted)]">{pkg.bestFor}</p>
            <form action={applyTemplatePackage.bind(null, pkg.id)} className="mt-auto">
              <button
                type="submit"
                className="w-full rounded-full bg-[var(--field)] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Use {pkg.name}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}
