import { notFound, redirect } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { standCheckoutUrl } from "@/lib/stand-qr";
import { standPublicHome } from "@/lib/storefront/legacy-stand-redirect";
import { businessSiteUrl } from "@/lib/storefront/business-site-url";
import BusinessPageHeader from "./BusinessPageHeader";
import BusinessSetupPrompt from "./BusinessSetupPrompt";
import BusinessSetupTabs, {
  isBusinessTabId,
  MOVED_BUSINESS_TABS,
  type BusinessTabId,
} from "./BusinessSetupTabs";
import StandBrandingForm from "./StandBrandingForm";
import StandSocialForm from "./StandSocialForm";
import BrandingManagedByWebsite from "./BrandingManagedByWebsite";
import { websiteBrandForStand } from "@/lib/storefront/stand-brand-source";
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

  const checkoutUrl = standCheckoutUrl(stand.slug, stand.cartMode);
  const [publicHome, websiteBrand, site] = await Promise.all([
    standPublicHome(stand.slug, checkoutUrl),
    websiteBrandForStand(stand.slug),
    businessSiteUrl(owner.id),
  ]);
  const brandingInWebStudio = websiteBrand !== null;
  return (
    <main className="flex flex-col gap-8">
      <SyncSelectedBusiness
        standId={stand.id}
        selectedId={selected?.id ?? null}
      />
      <BusinessPageHeader
        standId={stand.id}
        name={stand.name}
        publicUrl={publicHome.url}
        publicLabel={publicHome.label}
      />

      <BusinessSetupPrompt
        standId={stand.id}
        productCount={stand.products.length}
      />

      <BusinessSetupTabs standId={stand.id} active={tab} hideBranding={brandingInWebStudio} />

      {tab === "details" ? <StandEditForm stand={stand} site={site} /> : null}
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
      {tab === "branding" && brandingInWebStudio ? <BrandingManagedByWebsite /> : null}
      {tab === "branding" && !brandingInWebStudio ? (
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
