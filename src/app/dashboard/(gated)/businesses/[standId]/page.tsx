import { notFound, redirect } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { standCheckoutUrl, standQrDataUrl } from "@/lib/stand-qr";
import { standPaymentBrands } from "@/lib/stand-payment-brands";
import BusinessCheckoutStrip from "./BusinessCheckoutStrip";
import BusinessPageHeader from "./BusinessPageHeader";
import BusinessSetupPrompt from "./BusinessSetupPrompt";
import BusinessProductsTab from "./BusinessProductsTab";
import BusinessSetupTabs, {
  isBusinessTabId,
  type BusinessTabId,
} from "./BusinessSetupTabs";
import StandBrandingForm from "./StandBrandingForm";
import StandDeleteButton from "./StandDeleteButton";
import StandEditForm from "./StandEditForm";
import StandUpsellsForm from "./StandUpsellsForm";
import SyncSelectedBusiness from "@/components/SyncSelectedBusiness";
import { resolveSelectedBusiness } from "@/lib/selected-business";

export default async function StandDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ standId: string }>;
  searchParams: Promise<{ tab?: string; new?: string }>;
}) {
  const { standId } = await params;
  const { tab: tabParam, new: newParam } = await searchParams;
  if (tabParam === "payments") {
    redirect("/dashboard/checkout");
  }
  const tab: BusinessTabId = isBusinessTabId(tabParam) ? tabParam : "details";
  const isNewBusiness = newParam === "1";

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
  const qrDataUrl = await standQrDataUrl(checkoutUrl, 240);
  const paymentBrands = standPaymentBrands(stand, {
    ...owner,
    user: { email: user.email, role: user.role },
  });
  const productOpts = stand.products
    .filter((p) => !p.isHidden)
    .map((p) => ({
      id: p.id,
      name: p.name,
      priceCents: p.priceCents,
    }));

  return (
    <main className="flex flex-col gap-8">
      <SyncSelectedBusiness
        standId={stand.id}
        selectedId={selected?.id ?? null}
      />
      <BusinessPageHeader
        standId={stand.id}
        name={stand.name}
        slug={stand.slug}
        checkoutUrl={checkoutUrl}
      />

      <BusinessCheckoutStrip
        standId={stand.id}
        standSlug={stand.slug}
        qrDataUrl={qrDataUrl}
        paymentBrands={paymentBrands}
      />

      <BusinessSetupPrompt
        standId={stand.id}
        productCount={stand.products.length}
        isNew={isNewBusiness}
      />

      <BusinessSetupTabs standId={stand.id} active={tab} />

      {tab === "details" ? <StandEditForm stand={stand} /> : null}
      {tab === "branding" ? (
        <StandBrandingForm
          standId={stand.id}
          branding={{
            logoUrl: stand.logoUrl,
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
      {tab === "products" ? (
        <BusinessProductsTab
          standId={stand.id}
          currency={stand.currency}
          products={stand.products.map((p) => ({
            id: p.id,
            name: p.name,
            priceCents: p.priceCents,
            stockQuantity: p.stockQuantity,
          }))}
        />
      ) : null}
      {tab === "upsells" ? (
        <StandUpsellsForm
          standId={stand.id}
          currency={stand.currency}
          products={productOpts}
          conversion={{
            upsellProductId: stand.upsellProductId,
            upsellPriceCents: stand.upsellPriceCents,
            firstOrderDiscountEnabled: stand.firstOrderDiscountEnabled,
            firstOrderDiscountPercent: stand.firstOrderDiscountPercent,
            firstOrderDiscountAmountCents: stand.firstOrderDiscountAmountCents,
            showPublicScarcity: stand.showPublicScarcity,
          }}
        />
      ) : null}

      {tab === "details" ? (
        <StandDeleteButton standId={stand.id} standName={stand.name} />
      ) : null}
    </main>
  );
}
