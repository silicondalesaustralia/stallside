import type { StudioMetadata } from "@/lib/studio/types";
import SubscriptionListBody from "@/app/s/[standSlug]/sub/SubscriptionListBody";

/** Every live subscription and membership as cards (the subscriptions category). */
export default function StudioSubscriptionListBlock({ metadata }: { metadata: StudioMetadata }) {
  const data = metadata.commerceContext?.subscriptionList;
  if (!data) return null;
  return <SubscriptionListBody data={data} />;
}
