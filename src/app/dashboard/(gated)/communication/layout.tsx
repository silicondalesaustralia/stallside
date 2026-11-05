import ProFeatureGate from "@/components/dashboard/ProFeatureGate";

export default function CommunicationLayout({ children }: { children: React.ReactNode }) {
  return <ProFeatureGate feature="communication">{children}</ProFeatureGate>;
}
