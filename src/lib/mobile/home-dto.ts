import type { HomeRange, HomeResponse, SalesSummary } from "@/contracts/mobile/home";
import type { OrderSummary } from "@/lib/order-metrics";
import type { loadDashboardHomeData } from "@/lib/dashboard/home";

type HomeData = Awaited<ReturnType<typeof loadDashboardHomeData>>;

function toSales(summary: OrderSummary): SalesSummary {
  return {
    salesCents: summary.salesCents,
    orderCount: summary.orderCount,
    cashCents: summary.cashCents,
    digitalCents: summary.digitalCents,
    currency: summary.currency,
  };
}

export function toHomeResponse(
  data: HomeData,
  range: { key: HomeRange; label: string },
): HomeResponse {
  return {
    range,
    sales: {
      all: toSales(data.currentSummaries.all),
      stand: toSales(data.currentSummaries.stand),
      preorder: toSales(data.currentSummaries.preorder),
      subscription: toSales(data.currentSummaries.subscription),
    },
    previous: toSales(data.previousSummaries.all),
    productCount: data.products,
    lowStock: data.lowStockRows.map((row) => ({
      id: row.id,
      name: row.name,
      stockQuantity: Number(row.stockQuantity),
    })),
    recentOrders: data.recent.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      totalCents: order.totalCents,
      currency: order.currency,
      paymentMethod: order.paymentMethod,
    })),
    preOrderPageCount: data.preOrderPageCount,
    subscriptionOfferCount: data.subscriptionOfferCount,
    activeSubscriptions: data.activeShopperSubs,
  };
}
