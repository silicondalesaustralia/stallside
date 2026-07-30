import { demoRegionForStandSlug, isDemoStandSlug, type DemoRegion } from "@/lib/demo";
import type { RestockOptInProps } from "./restock-opt-in-gate";

export type PreOrderSuccessInfo = {
  collectionLabel: string;
  collectionNote: string | null;
  items: { name: string; quantity: number }[];
  customerName: string | null;
};

export type SuccessPageState = {
  message: string;
  demoStandSlug: string | null;
  demoRegion: DemoRegion | null;
  demoTotalCents?: number;
  demoCurrency?: string;
  restock: RestockOptInProps | null;
  preOrder: PreOrderSuccessInfo | null;
};

export const emptySuccessState = (): SuccessPageState => ({
  message: "Thanks - your payment is being confirmed.",
  demoStandSlug: null,
  demoRegion: null,
  restock: null,
  preOrder: null,
});

export function applyDemo(
  state: SuccessPageState,
  order: {
    totalCents: number;
    currency: string;
    stand: { slug: string } | null;
  } | null,
) {
  if (!order?.stand || !isDemoStandSlug(order.stand.slug)) return;
  state.demoStandSlug = order.stand.slug;
  state.demoRegion = demoRegionForStandSlug(order.stand.slug);
  state.demoTotalCents = order.totalCents;
  state.demoCurrency = order.currency;
}

export function applyFulfillResult(
  state: SuccessPageState,
  result: { orderNumber?: string; error?: string },
): boolean {
  if ("orderNumber" in result && result.orderNumber) {
    state.message = "Payment confirmed. You're all set.";
    return true;
  }
  if ("error" in result && result.error) {
    state.message = result.error;
  }
  return false;
}
