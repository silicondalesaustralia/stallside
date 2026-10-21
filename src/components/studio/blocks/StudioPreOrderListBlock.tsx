import type { StudioMetadata } from "@/lib/studio/types";
import PreOrderListBody from "@/app/s/[standSlug]/pre/PreOrderListBody";

/** Every open pre-order page as cards (the pre-orders category). */
export default function StudioPreOrderListBlock({ metadata }: { metadata: StudioMetadata }) {
  const data = metadata.commerceContext?.preOrderList;
  if (!data) return null;
  return <PreOrderListBody data={data} />;
}
