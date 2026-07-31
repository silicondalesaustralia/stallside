import { appBaseUrl } from "@/lib/app-url";

export function lifecycleLinks() {
  const base = appBaseUrl();
  return {
    base,
    newStand: `${base}/dashboard/stands/new`,
    stands: `${base}/dashboard/stands`,
    knowledge: `${base}/dashboard/knowledge`,
    firstStand: `${base}/dashboard/knowledge/first-stand`,
    customerPayments: `${base}/dashboard/knowledge/customer-payments`,
    billingGuide: `${base}/dashboard/knowledge/billing`,
    settings: `${base}/dashboard/settings`,
    billing: `${base}/dashboard/settings/billing`,
    billingPro: `${base}/dashboard/settings/billing`,
    stripe: `${base}/dashboard/settings/stripe`,
    contact: `${base}/contact`,
    featureRequest: `${base}/contact?subject=feature-request`,
    feedback: `${base}/contact?subject=feedback`,
    gallerySubmit: `${base}/dashboard/gallery/submit`,
    gallery: `${base}/gallery`,
  };
}

export type LifecycleLinks = ReturnType<typeof lifecycleLinks>;
