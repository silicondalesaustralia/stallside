import ProFeatureGate from "@/components/dashboard/ProFeatureGate";

export default function DuplicateBusinessQrLayout({ children }: { children: React.ReactNode }) {
  return <ProFeatureGate feature="qrCodes">{children}</ProFeatureGate>;
}
