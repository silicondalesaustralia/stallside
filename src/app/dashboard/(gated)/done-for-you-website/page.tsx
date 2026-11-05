import PageHeader from "@/components/dashboard/ui/PageHeader";
import { ownerIdHasProAccess } from "@/lib/owner-pro-access";
import { requireOwner } from "@/lib/session";
import {
  DFY_BUILD_INCLUDES,
  DFY_BUILD_SUMMARY,
  DFY_BUILD_TITLE,
  dfyBuildCurrency,
  formatDfyBuildPrice,
} from "@/lib/website/dfy-build";
import { isDfyBuildSessionPaid } from "@/lib/website/dfy-build-checkout";
import DfyBuildForm from "./DfyBuildForm";
import DfyBuildSteps from "./DfyBuildSteps";

const ERRORS: Record<string, string> = {
  domain: "That domain doesn't look right. Use something like www.yourbusiness.com, or leave it blank.",
  checkout: "Payment could not be started. Please try again.",
  impersonating: "Purchases are disabled while you're impersonating an owner.",
};

async function paidSession(ownerId: string, sessionId: string | undefined): Promise<boolean> {
  if (!sessionId || !/^cs_[a-zA-Z0-9_]+$/.test(sessionId)) return false;
  try {
    return await isDfyBuildSessionPaid(ownerId, sessionId);
  } catch (err) {
    console.error("[dfyBuild] session check failed", { ownerId, err });
    return false;
  }
}

export default async function DoneForYouWebsitePage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; cancelled?: string; error?: string }>;
}) {
  const { owner } = await requireOwner();
  const sp = await searchParams;
  const isPro = await ownerIdHasProAccess(owner.id);
  const price = formatDfyBuildPrice(dfyBuildCurrency(owner.billingCurrency));
  const paid = await paidSession(owner.id, sp.session_id);
  const error = sp.error ? ERRORS[sp.error] : undefined;

  return (
    <main className="flex max-w-3xl flex-col gap-5 pb-12">
      <PageHeader title={DFY_BUILD_TITLE} subtitle={DFY_BUILD_SUMMARY} />
      {paid ? (
        <p role="status" className="dash-card p-4 text-sm font-semibold text-[var(--leaf-dark)]">
          Thanks, your website build is booked. Within 2 business days we&apos;ll email you a list of what we need from you to get started.
        </p>
      ) : null}
      {sp.cancelled === "1" ? (
        <p role="status" className="dash-card p-4 text-sm text-[var(--muted)]">
          Checkout was cancelled, so you haven&apos;t been charged.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="dash-card p-4 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      <section className="dash-card flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold text-[var(--field)]">What&apos;s included</h2>
          <p className="text-lg font-bold text-[var(--field)]">
            {price} <span className="text-sm font-normal text-[var(--muted)]">one-off</span>
          </p>
        </div>
        <ul className="flex flex-col gap-1.5 text-sm text-[var(--muted)]">
          {DFY_BUILD_INCLUDES.map((item) => (
            <li key={item}>✓ {item}</li>
          ))}
        </ul>
        <p className="text-xs text-[var(--muted)]">
          Connecting a domain you already own is included. Domains can&apos;t be bought through Vendl yet, so if you
          don&apos;t have one, buy it from any domain registrar and we&apos;ll connect it for you.
        </p>
      </section>
      <DfyBuildSteps />
      {paid ? null : <DfyBuildForm price={price} isPro={isPro} />}
    </main>
  );
}
