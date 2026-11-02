import ProFeatureGate from "@/components/dashboard/ProFeatureGate";

export default function NewQrLayout({ children }: { children: React.ReactNode }) {
  return <ProFeatureGate feature="qrCodes">{children}</ProFeatureGate>;
}
