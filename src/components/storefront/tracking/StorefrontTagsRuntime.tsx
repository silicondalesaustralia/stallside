"use client";

import type { PublicTagsConfig } from "@/lib/website/tracking/types";
import ConsentBanner from "./ConsentBanner";
import TagsDebugPanel from "./TagsDebugPanel";
import { useStorefrontTags } from "./useStorefrontTags";

/** Loads the seller's tags (consent-aware) and forwards storefront events to them. */
export default function StorefrontTagsRuntime({ config }: { config: PublicTagsConfig }) {
  const { needsConsent, choice, bannerOpen, decide, closeBanner } = useStorefrontTags(config);
  const consentLabel = needsConsent ? (choice ?? "waiting for visitor") : "not required for this visitor";
  return (
    <>
      {bannerOpen ? (
        <ConsentBanner privacyHref={config.privacyHref} current={choice} onDecide={decide} onClose={closeBanner} />
      ) : null}
      {config.debug ? <TagsDebugPanel ids={config.ids} consent={consentLabel} /> : null}
    </>
  );
}
