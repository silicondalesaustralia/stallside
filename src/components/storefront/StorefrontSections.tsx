import Link from "next/link";
import { primaryLocationLabel } from "@/lib/business-mode";
import type { BusinessMode } from "@/lib/business-mode";
import { standCatalogPath } from "@/lib/stand-seo";
import { storefrontButtonClass } from "@/lib/storefront/branding";
import type { ResolvedStorefrontBranding } from "@/lib/storefront/types";

export function StorefrontSocialLinks({
  branding,
}: {
  branding: ResolvedStorefrontBranding;
}) {
  const links = [
    { href: branding.instagramUrl, label: "Instagram" },
    { href: branding.facebookUrl, label: "Facebook" },
    { href: branding.tiktokUrl, label: "TikTok" },
    { href: branding.youtubeUrl, label: "YouTube" },
    { href: branding.websiteUrl, label: "Website" },
  ].filter((l) => l.href?.trim());

  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href!}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--field)] hover:border-[var(--leaf)]"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

export function StorefrontFarmStandSection({
  standName,
  standSlug,
  suburb,
  businessMode,
  branding,
}: {
  standName: string;
  standSlug: string;
  suburb: string | null;
  businessMode: BusinessMode;
  branding: ResolvedStorefrontBranding;
}) {
  const label = primaryLocationLabel(businessMode);
  const btnClass = storefrontButtonClass(branding);

  return (
    <section className="rounded-[var(--storefront-radius,var(--radius))] border border-[var(--line)] bg-[var(--panel)] p-6 sm:p-8">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
        {businessMode === "BOTH" ? "Visit our farm stand" : label}
      </h2>
      <p className="mt-2 text-[var(--muted)]">
        {standName}
        {suburb ? ` · ${suburb}` : ""}
      </p>
      <p className="mt-3 text-sm text-[var(--muted)]">
        Self-service checkout with QR — open when you arrive.
      </p>
      <Link
        href={standCatalogPath(standSlug)}
        className={`mt-6 inline-flex ${btnClass}`}
      >
        {businessMode === "FOOD_BUSINESS" ? "Open shop" : "Open stand"}
      </Link>
    </section>
  );
}

export function StorefrontHowOrderingSection({
  fulfilmentIntents,
}: {
  fulfilmentIntents: string[];
}) {
  const steps: string[] = [];
  steps.push("Browse products and add what you need to your cart.");
  if (fulfilmentIntents.includes("pickup")) {
    steps.push("Choose pickup at checkout — we'll confirm your order by email.");
  } else if (fulfilmentIntents.includes("delivery")) {
    steps.push("Enter your details at checkout for local delivery.");
  } else {
    steps.push("Pay securely at checkout — card, Apple Pay or Google Pay where available.");
  }
  steps.push("We'll let you know when your order is ready.");

  return (
    <section>
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
        How ordering works
      </h2>
      <ol className="mt-4 space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-[var(--muted)]">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--leaf)] text-sm font-bold text-white">
              {i + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function StorefrontPickupSection({
  fulfilmentIntents,
  regionLabel,
}: {
  fulfilmentIntents: string[];
  regionLabel: string | null;
}) {
  const hasPickup = fulfilmentIntents.includes("pickup");
  const hasDelivery = fulfilmentIntents.includes("delivery");
  if (!hasPickup && !hasDelivery) return null;

  return (
    <section className="rounded-[var(--storefront-radius,var(--radius))] bg-[var(--wash)] p-6 sm:p-8">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
        {hasPickup && hasDelivery
          ? "Pickup & delivery"
          : hasPickup
            ? "Pickup"
            : "Local delivery"}
      </h2>
      {regionLabel ? (
        <p className="mt-2 font-medium text-[var(--leaf-dark)]">{regionLabel}</p>
      ) : null}
      <p className="mt-3 text-[var(--muted)]">
        {hasPickup && hasDelivery
          ? "Order online for pickup or local delivery — details confirmed at checkout."
          : hasPickup
            ? "Order online and collect at a time that suits you."
            : "We deliver locally — enter your suburb at checkout."}
      </p>
    </section>
  );
}
