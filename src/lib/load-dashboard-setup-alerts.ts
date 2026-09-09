import { prisma } from "@/lib/prisma";
import type { DashboardSetupAlerts } from "@/lib/dashboard-setup-alerts";
import { productDashboardWhere } from "@/lib/product-visibility";
import { withSquarePaymentsReady } from "@/lib/stand-payment-brands";

export async function loadDashboardSetupAlerts(input: {
  ownerId: string;
  businessCount: number;
  selectedStandId: string | null;
  stripeAccountId: string | null;
  stripeChargesEnabled: boolean;
}): Promise<DashboardSetupAlerts> {
  const needsBusiness = input.businessCount === 0;

  let productCount = 0;
  if (!needsBusiness && input.selectedStandId) {
    productCount = await prisma.product.count({
      where: {
        ownerId: input.ownerId,
        standId: input.selectedStandId,
        ...productDashboardWhere,
      },
    });
  }

  const needsProducts =
    !needsBusiness && Boolean(input.selectedStandId) && productCount === 0;

  const owner = await prisma.owner.findUnique({
    where: { id: input.ownerId },
    select: { billingCurrency: true },
  });
  const { squarePaymentsReady } = await withSquarePaymentsReady({
    id: input.ownerId,
    billingCurrency: owner?.billingCurrency,
  });

  const cardPaymentsReady =
    input.stripeChargesEnabled || squarePaymentsReady;

  const needsStripe =
    !needsBusiness &&
    !cardPaymentsReady &&
    Boolean(input.stripeAccountId || productCount > 0);

  return { needsBusiness, needsProducts, needsStripe };
}
