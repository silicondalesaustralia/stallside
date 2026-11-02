import ProFeatureGate from "@/components/dashboard/ProFeatureGate";

export default function UpsellLayout({ children }: { children: React.ReactNode }) {
  return <ProFeatureGate feature="upsells">{children}</ProFeatureGate>;
}
