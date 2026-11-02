import ProFeatureGate from "@/components/dashboard/ProFeatureGate";

export default function NewUpsellLayout({ children }: { children: React.ReactNode }) {
  return <ProFeatureGate feature="upsells">{children}</ProFeatureGate>;
}
