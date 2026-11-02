import ProFeatureGate from "@/components/dashboard/ProFeatureGate";

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return <ProFeatureGate feature="reviews">{children}</ProFeatureGate>;
}
