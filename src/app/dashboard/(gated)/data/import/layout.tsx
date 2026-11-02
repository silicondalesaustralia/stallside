import ProFeatureGate from "@/components/dashboard/ProFeatureGate";

export default function DataImportLayout({ children }: { children: React.ReactNode }) {
  return <ProFeatureGate feature="dataImport">{children}</ProFeatureGate>;
}
