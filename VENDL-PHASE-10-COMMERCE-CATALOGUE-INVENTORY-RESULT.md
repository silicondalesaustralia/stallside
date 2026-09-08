# VENDL Phase 10 — Commerce Catalogue / Inventory Result

## Gate

```text
PHASE 10 CATALOGUE FOUNDATION PASSED
```

(Incremental path — see ownership note below.)

## Product ownership migration

**Approach taken (safer incremental):**

- `Product.ownerId` is the catalogue owner.
- `Product.standId` remains required as the **primary selling channel** for
  URL/slug uniqueness (`/s/[standSlug]/…`) and default inventory location binding.
- Multi-channel availability continues via existing `ProductChannel`
  (`STAND` / `ONLINE`) — already shipped in Phase 3.
- Destructive nullable-`standId` migration (Phase 3I) remains deferred; combining
  it with Square would be high-risk and was explicitly out of scope for a
  “force Square onto stand-scoped catalogue” rewrite.

Schema comment on `Product` documents this ownership model.

## Backfill

No destructive product ownership backfill required. Existing products keep
working; farm-stand QR URLs unchanged.

## Channel availability

Unchanged behaviour via `ProductChannel` + `productOnStandWhere`.

## External mappings (provider-neutral)

Added Prisma models:

- `ExternalCommerceConnection`
- `ExternalLocationMapping`
- `ExternalProductMapping`
- `ExternalVariantMapping` (maps sellable `Product` → Square variation;
  Vendl has no `ProductVariant` SKU table yet)
- `SquareWebhookReceipt` (idempotent webhook ACK)

## Inventory architecture

- Extended `InventorySource`: `ORDER_SQUARE`, `EXTERNAL_SYNC`, `EXTERNAL_POS`,
  `RECONCILIATION`
- `InventoryAdjustment.externalEventId` (unique) + `externalReference`
  for idempotency / echo-loop prevention
- `SaleOrigin` on `Order` for fee + reporting separation
- Square → Vendl apply path + Vendl → Square Inventory API push (not Orders API)

## Regression

- TypeScript: pass (`tsc --noEmit`)
- Production build: pass
- Unit tests (`npm run test:square`): pass
- PayPal WIP: untouched
- Stripe paths: unchanged except post-pay Square inventory push when mapped

## Known limitations

- No full ON_HAND / RESERVED ledger table yet — still `stockQuantity` +
  adjustment history (matches current checkout races).
- No per-option-choice stock (options remain price deltas).
- Seller must confirm catalogue mappings (exact SKU/UPC/name only).

## Git status

Uncommitted local work — not committed/pushed (per brief hard constraint).
