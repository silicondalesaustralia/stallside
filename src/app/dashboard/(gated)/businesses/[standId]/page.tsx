import { notFound, redirect } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ownerHasProAccess } from "@/lib/owner-trial";
import { isPayPalConnectAvailable } from "@/lib/paypal";
import { standCheckoutUrl } from "@/lib/stand-qr";
import { standPublicHome } from "@/lib/storefront/legacy-stand-redirect";
import BusinessPageHeader from "./BusinessPageHeader";
import BusinessSetupPrompt from "./BusinessSetupPrompt";
import BusinessPaymentsTab from "./BusinessPaymentsTab";
import BusinessSetupTabs, {
  isBusinessTabId,
  MOVED_BUSINESS_TABS,
  type BusinessTabId,
} from "./BusinessSetupTabs";
import StandBrandingForm from "./StandBrandingForm";
import StandDeleteButton from "./StandDeleteButton";
import StandEditForm from "./StandEditForm";
import PaymentsOverview from "./PaymentsOverview";
import { squareEligibleBillingCurrency } from "@/lib/commerce/payment-rail";
import { ownerSquareReady } from "@/lib/square/owner-ready";
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

  const { owner, user } = await requireOwner();
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
  const publicHome = await standPublicHome(stand.slug, checkoutUrl);
  const cardTier = ownerHasProAccess(owner, {
    email: user.email,
    role: user.role,
  });
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

      <BusinessSetupTabs standId={stand.id} active={tab} />

      {tab === "details" ? <StandEditForm stand={stand} /> : null}
      {tab === "payments" ? (
        <BusinessPaymentsTab
          standId={stand.id}
          currency={stand.currency}
          localTransferAlias={stand.localTransferAlias}
          localTransferMethodId={stand.localTransferMethodId}
          acceptCash={stand.acceptCash}
          acceptLocalTransfer={stand.acceptLocalTransfer}
          acceptCard={stand.acceptCard}
          acceptPayPal={stand.acceptPayPal}
          cardReady={Boolean(
            owner.stripeAccountId && owner.stripeChargesEnabled,
          )}
          paypalReady={Boolean(
            owner.paypalMerchantId &&
              owner.paypalOnboardingComplete &&
              owner.paypalPaymentsEnabled,
          )}
          paypalConnectAvailable={isPayPalConnectAvailable()}
          cardTier={cardTier}
          stripeConnected={owner.stripeChargesEnabled}
          stripeStarted={Boolean(owner.stripeAccountId)}
          productCount={stand.products.length}
          square={
            squareEligibleBillingCurrency(owner.billingCurrency)
              ? {
                  accept: stand.acceptSquare,
                  ready: await ownerSquareReady(owner),
                  isProvider: owner.onlinePaymentProvider === "SQUARE",
                }
              : null
          }
          overview={<PaymentsOverview owner={owner} />}
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
            instagramUrl: stand.instagramUrl,
            facebookUrl: stand.facebookUrl,
            tiktokUrl: stand.tiktokUrl,
            youtubeUrl: stand.youtubeUrl,
            websiteUrl: stand.websiteUrl,
          }}
        />
      ) : null}
      {tab === "details" ? (
        <StandDeleteButton standId={stand.id} standName={stand.name} />
      ) : null}
    </main>
  );
}
