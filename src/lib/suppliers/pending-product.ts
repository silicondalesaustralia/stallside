/**
 * A supplier's separate product is created archived + hidden so it can't be
 * bought before the owner sets a price. Every delete/archive path clears
 * isHidden, so archived + hidden means "waiting for the owner to publish".
 */
export const supplierProductListWhere = {
  OR: [{ isArchived: false }, { isArchived: true, isHidden: true }],
};

export function isAwaitingPublish(product: { isArchived: boolean; isHidden: boolean }): boolean {
  return product.isArchived && product.isHidden;
}
