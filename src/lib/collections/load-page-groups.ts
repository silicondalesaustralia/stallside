import { loadCollectionOrders, toCollectionOrderView } from "./load-collections";
import { groupCollectionPages, type CollectionPageGroup } from "./group-collection-pages";
import { loadStandPreOrderPages } from "./load-preorder-pages";
import { loadStandSubscriptionOffers } from "./load-subscription-offers";

/** Paid pre-order and subscription orders for a business, grouped by pre-order page / cycle. */
export async function loadCollectionPageGroups(ownerId: string, standId: string): Promise<CollectionPageGroup[]> {
  const [rawOrders, pages, offers] = await Promise.all([
    loadCollectionOrders(ownerId, standId),
    loadStandPreOrderPages(ownerId, standId),
    loadStandSubscriptionOffers(ownerId, standId),
  ]);
  return groupCollectionPages(rawOrders.map(toCollectionOrderView), pages, offers);
}
