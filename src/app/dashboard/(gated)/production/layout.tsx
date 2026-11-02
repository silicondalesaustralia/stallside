import ProFeatureGate from "@/components/dashboard/ProFeatureGate";

export default function ProductionLayout({ children }: { children: React.ReactNode }) {
  return <ProFeatureGate feature="production">{children}</ProFeatureGate>;
}
