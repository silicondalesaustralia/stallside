import ProFeatureGate from "@/components/dashboard/ProFeatureGate";

export default function DiscountsLayout({ children }: { children: React.ReactNode }) {
  return <ProFeatureGate feature="discounts">{children}</ProFeatureGate>;
}
