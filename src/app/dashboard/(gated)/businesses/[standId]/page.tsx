import { notFound, redirect } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { BusinessSiteUrl } from "@/lib/storefront/business-site-url";
import {
  storefrontPublicSiteForOwner,
  storefrontPublicUrl,
} from "@/lib/storefront/stand-public-url";
import { ownerIdHasProAccess } from "@/lib/owner-pro-access";
import BusinessPageHeader from "./BusinessPageHeader";
import BusinessSetupPrompt from "./BusinessSetupPrompt";
import BusinessSetupTabs, {
  isBusinessTabId,
  MOVED_BUSINESS_TABS,
  type BusinessTabId,
} from "./BusinessSetupTabs";
import StandBrandingForm from "./StandBrandingForm";
import StandSocialForm from "./StandSocialForm";
import StandDeleteButton from "./StandDeleteButton";
import StandEditForm from "./StandEditForm";
import SyncSelectedBusiness from "@/components/SyncSelectedBusiness";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { GET_STARTED_PATH } from "@/lib/onboarding/onboarding-gate";

export default async function StandDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ standId: string }>;
  searchParams: Promise<{ tab?: string; new?: string }>;
}) {
  const { standId } = await params;
  const { tab: tabParam, new: newParam } = await searchParams;
  if (tabParam && MOVED_BUSINESS_TABS[tabParam]) redirect(MOVED_BUSINESS_TABS[tabParam]);
  const tab: BusinessTabId = isBusinessTabId(tabParam) ? tabParam : "details";
  if (newParam === "1") redirect(GET_STARTED_PATH);

  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  const stand = await prisma.stand.findFirst({
    where: { id: standId, ownerId: owner.id },
    include: {
      products: {
        where: { isArchived: false },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  if (!stand) notFound();

  const [isPro, storeSite] = await Promise.all([
    ownerIdHasProAccess(owner.id),
    storefrontPublicSiteForOwner(owner.id, owner.businessName || stand.name),
  ]);
  const url = storefrontPublicUrl(storeSite, "/");
  const { host, pathname } = new URL(url);
  const site: BusinessSiteUrl = {
    url,
    label: `${host}${pathname === "/" ? "" : pathname}`,
    customDomain: Boolean(storeSite.primaryCustomHostname),
    published: storeSite.published,
  };
  return (
    <main className="flex flex-col gap-8">
      <SyncSelectedBusiness
        standId={stand.id}
        selectedId={selected?.id ?? null}
      />
      <BusinessPageHeader
        standId={stand.id}
        name={stand.name}
        publicUrl={site.url}
        publicLabel={site.label}
      />

      <BusinessSetupPrompt
        standId={stand.id}
        productCount={stand.products.length}
      />

      <BusinessSetupTabs standId={stand.id} active={tab} />

      {tab === "details" ? <StandEditForm stand={stand} site={site} isPro={isPro} storeLink={site} /> : null}
      {tab === "details" ? (
        <StandSocialForm
          standId={stand.id}
          social={{
            instagramUrl: stand.instagramUrl,
            facebookUrl: stand.facebookUrl,
            tiktokUrl: stand.tiktokUrl,
            youtubeUrl: stand.youtubeUrl,
            websiteUrl: stand.websiteUrl,
          }}
        />
      ) : null}
      {tab === "branding" ? (
        <StandBrandingForm
          standId={stand.id}
          branding={{
            logoUrl: stand.logoUrl,
            ogImageUrl: stand.ogImageUrl,
            accentColor: stand.accentColor,
            secondaryColor: stand.secondaryColor,
          }}
        />
      ) : null}
      {tab === "details" ? (
        <StandDeleteButton standId={stand.id} standName={stand.name} />
      ) : null}
    </main>
  );
}
