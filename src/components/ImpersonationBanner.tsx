import { stopImpersonating } from "@/app/admin/owners/impersonate-actions";

export default function ImpersonationBanner({
  targetEmail,
  adminEmail,
}: {
  targetEmail: string;
  adminEmail: string;
}) {
  return (
    <div className="border-b border-amber-300 bg-amber-50 print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-sm">
        <p className="text-amber-950">
          <span className="font-semibold">Admin view</span>
          {" · "}
          logged in as <strong>{targetEmail}</strong>
          {adminEmail ? (
            <span className="text-amber-900/70"> ({adminEmail})</span>
          ) : null}
        </p>
        <form action={stopImpersonating}>
          <button
            type="submit"
            className="rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-sm font-semibold text-amber-950 hover:bg-amber-100"
          >
            Back to admin
          </button>
        </form>
      </div>
    </div>
  );
}
