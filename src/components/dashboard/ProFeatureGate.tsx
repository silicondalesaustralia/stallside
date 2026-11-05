import PageHeader from "@/components/dashboard/ui/PageHeader";
import ProGateCard from "@/components/dashboard/ProGateCard";
import { ownerIdHasProAccess } from "@/lib/owner-pro-access";
import { PRO_GATES, type ProGateKey } from "@/lib/plan/pro-gates";
import { requireOwner } from "@/lib/session";

/** Section layout gate: Pro owners see the section, Free owners see its upgrade card. */
export default async function ProFeatureGate({
  feature,
  children,
  freeExtra,
}: {
  feature: ProGateKey;
  children: React.ReactNode;
  /** Shown under the upgrade card for Free owners. */
  freeExtra?: React.ReactNode;
}) {
  const { owner } = await requireOwner();
  if (await ownerIdHasProAccess(owner.id)) return <>{children}</>;
  return (
    <main className="flex max-w-3xl flex-col gap-5">
      <PageHeader title={PRO_GATES[feature].title} />
      <ProGateCard feature={feature} />
      {freeExtra}
    </main>
  );
}
