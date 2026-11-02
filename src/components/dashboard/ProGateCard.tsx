import ProUpgradeCard from "@/components/dashboard/ProUpgradeCard";
import { PRO_GATES, type ProGateKey } from "@/lib/plan/pro-gates";

/** The upgrade card for one Pro-only feature, used where part of a Free page is locked. */
export default function ProGateCard({ feature }: { feature: ProGateKey }) {
  const gate = PRO_GATES[feature];
  return (
    <ProUpgradeCard eyebrow={gate.eyebrow}>
      {gate.body} Included with Vendl Pro.
    </ProUpgradeCard>
  );
}
