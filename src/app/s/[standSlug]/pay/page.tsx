import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { localTransferForCurrency } from "@/lib/local-transfer";
import { standOffersCard, standOffersPayPal } from "@/lib/stand-payment-brands";
import { isDemoStandSlug } from "@/lib/demo";
import { publicStandBranding } from "@/lib/public-stand-branding";
import { standAccentStyle } from "@/lib/stand-brand";
import { standCatalogPath } from "@/lib/stand-seo";
import {
  ownerPassesFeeToCustomer,
  shouldChargeVendlFee,
} from "@/lib/stallside-fee";
import StandStoreHeader from "../StandStoreHeader";
import CustomerChoiceCheckout from "../CustomerChoiceCheckout";

export const metadata: Metadata = {
  title: "Pay",
  robots: { index: false, follow: false },
};

export default async function CustomerChoicePayPage({
  params,
}: {
  params: Promise<{ standSlug: string }>;
}) {
  const { standSlug } = await params;
  const slug = decodeURIComponent(standSlug).trim().toLowerCase();
  const stand = await prisma.stand.findUnique({
    where: { slug },
    include: {
      owner: { include: { user: { select: { email: true, role: true } } } },
    },
  });
  if (!stand || !stand.isActive) notFound();
  if (stand.cartMode !== "CUSTOMER_CHOICE") {
    redirect(standCatalogPath(stand.slug));
  }

  const method = localTransferForCurrency(stand.currency);
  const alias = stand.localTransferAlias?.trim() ?? "";
  const localTransfer =
    stand.acceptLocalTransfer &&
    method &&
    alias &&
    stand.localTransferMethodId === method.id
      ? {
          methodId: method.id,
          buttonLabel: method.buttonLabel,
          aliasLabel: method.checkoutAliasLabel,
          alias,
        }
      : null;

  const branded = publicStandBranding(stand, stand.owner);
  const isDemo = isDemoStandSlug(stand.slug);

  return (
    <main
      className="mx-auto min-h-full w-full max-w-lg px-4 pb-8 pt-8"
      style={standAccentStyle(branded.accentColor, branded.secondaryColor)}
    >
      <StandStoreHeader
        standName={stand.name}
        standSlug={stand.slug}
        logoUrl={branded.logoUrl}
      />
      <h2 className="mt-6 font-[family-name:var(--font-display)] text-2xl font-bold">
        Pay what you picked
      </h2>
      <CustomerChoiceCheckout
        standSlug={stand.slug}
        currency={stand.currency}
        cashEnabled={stand.acceptCash}
        cardEnabled={standOffersCard(stand, {
          ...stand.owner,
          user: stand.owner.user,
        })}
        paypalEnabled={standOffersPayPal(stand, {
          ...stand.owner,
          user: stand.owner.user,
        })}
        paypalClientId={process.env.PAYPAL_CLIENT_ID ?? null}
        paypalMerchantId={stand.owner.paypalMerchantId}
        paypalSandbox={
          (process.env.PAYPAL_MODE || "sandbox").toLowerCase() !== "live"
        }
        localTransfer={localTransfer}
        passFeeToCustomer={ownerPassesFeeToCustomer(stand.owner)}
        stallsideFeeApplies={shouldChargeVendlFee(stand.owner)}
        showDemoCardHint={isDemo}
      />
    </main>
  );
}
