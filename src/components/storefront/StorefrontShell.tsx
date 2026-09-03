import type { ReactNode } from "react";
import { storefrontThemeStyle } from "@/lib/storefront/branding";
import type { ResolvedStorefrontBranding } from "@/lib/storefront/types";
import StorefrontNav from "./StorefrontNav";
import StorefrontOriginTracker from "./StorefrontOriginTracker";
import type { ShopFulfilmentOptionView } from "@/lib/fulfilment/shop-types";
import StorefrontFulfilmentPicker from "./StorefrontFulfilmentPicker";
import type { StorefrontPageId } from "@/lib/storefront/types";
import { currentStorefrontBasePath } from "@/lib/tenancy/request-base-path";
import { StorefrontLinkProvider } from "./StorefrontLinkProvider";

export default async function StorefrontShell({
  storefrontSlug,
  standSlug,
  branding,
  activePage,
  enabledPages,
  draft,
  isDraftPreview,
  fulfilmentOptions = [],
  currency = "AUD",
  children,
}: {
  storefrontSlug: string;
  standSlug: string;
  branding: ResolvedStorefrontBranding;
  activePage: StorefrontPageId | "product";
  enabledPages: StorefrontPageId[];
  draft?: boolean;
  isDraftPreview?: boolean;
  fulfilmentOptions?: ShopFulfilmentOptionView[];
  currency?: string;
  children: ReactNode;
}) {
  const basePath = await currentStorefrontBasePath(storefrontSlug);

  return (
    <div
      className="min-h-full bg-[var(--wash)] text-[var(--ink)]"
      style={storefrontThemeStyle(branding)}
    >
      {!draft ? <StorefrontOriginTracker storefrontSlug={storefrontSlug} /> : null}
      {isDraftPreview ? (
        <div className="bg-[var(--field)] px-4 py-2 text-center text-xs font-semibold text-white">
          Draft preview — not visible to customers
        </div>
      ) : null}
      <StorefrontNav
        storefrontSlug={storefrontSlug}
        standSlug={standSlug}
        branding={branding}
        activePage={activePage}
        enabledPages={enabledPages}
        draft={draft}
        basePath={basePath}
      />
      {!draft && fulfilmentOptions.length > 1 ? (
        <StorefrontFulfilmentPicker
          options={fulfilmentOptions}
          currency={currency}
        />
      ) : null}
      <StorefrontLinkProvider
        slug={storefrontSlug}
        basePath={basePath}
        draft={draft}
      >
        <div className="pb-28">{children}</div>
      </StorefrontLinkProvider>
    </div>
  );
}
